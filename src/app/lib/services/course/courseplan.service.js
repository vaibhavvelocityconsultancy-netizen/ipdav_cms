import { prisma } from "../../prisma";
import { requirePermission } from "../../withPermission";

// get all courses
export async function getAllCourses() {
  // await requirePermission("courses_view");
  try {
    return await prisma.course.findMany({
      include: {
        modules: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// get Course by id
export async function getCourseById(id) {
  // await requirePermission("courses_view");
  return prisma.course.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      modules: true,
    },
  });
}

// create course
export async function createCourse(input) {
  // await requirePermission("courses_create");
  const { session } = await requirePermission("courses_create");
  const tenantId = session.user.tenantId;
  const existing = await prisma.course.findFirst({
    where: {
      tenantId,
      slug: input.slug,
    },
  });
  if (existing) {
    throw new Error(`Course with slug "${input.slug}" already exists`);
  }
  console.log("INPUT:", JSON.stringify(input, null, 2));
  const { id, modules = [], ...courseData } = input;
  console.log("MODULES:", modules);
  return prisma.course.create({
    data: {
      ...courseData,
      tenantId,
      modules: {
        create: modules.map((module) => ({
          title: module.title,
        })),
      },
    },
    include: {
      modules: true,
    },
  });
}

// update course
export async function updateCourse(id, course) {
  console.log("UPDATE COURSE ID:", id);
  // await requirePermission("courses_update");
  const { session } = await requirePermission("courses_update");
  const tenantId = session.user.tenantId;
  const existingCourse = await prisma.course.findUnique({
    where: {
      id: Number(id),
      tenantId,
    },
  });
  console.log("FOUND COURSE:", existingCourse);
  if (!existingCourse) {
    throw new Error("Course not found");
  }
  const { modules = [], ...courseData } = course;
  console.log("MODULES RECEIVED:", modules);

  // ── Slug collision check ─────────────────────────────────────
  // findUnique above only confirmed THIS course exists — it never
  // checked whether the new slug is already owned by a DIFFERENT
  // course. Without this, editing Course B to use Course A's slug
  // silently succeeds and breaks Course A's URL/lookup.
  if (courseData.slug) {
    const duplicateSlug = await prisma.course.findFirst({
      where: {
        slug: courseData.slug,
        NOT: {
          id: Number(id),
        },
      },
    });

    if (duplicateSlug) {
      throw new Error(
        `Slug "${courseData.slug}" is already used by another course`,
      );
    }
  }

  // ── Delete modules that were removed in the UI ─────────────────
  // update/create alone never removes rows. If the admin deletes a
  // module client-side and that module's id is missing from the
  // incoming list, it would otherwise stay in the DB forever,
  // orphaned but still attached to this course. Diff against what
  // the client sent and delete anything no longer present.
  const incomingModuleIds = modules
    .filter((module) => module.id)
    .map((module) => Number(module.id));

  await prisma.courseModule.deleteMany({
    where: {
      courseContentId: Number(id),
      id: {
        notIn: incomingModuleIds,
      },
    },
  });

  return prisma.course.update({
    where: {
      id: Number(id),
    },
    data: {
      ...courseData,
      modules: {
        // update existing modules
        update: modules
          .filter((module) => module.id)
          .map((module) => ({
            where: {
              id: Number(module.id),
            },
            data: {
              title: module.title,
            },
          })),
        // create new modules
        create: modules
          .filter((module) => !module.id)
          .map((module) => ({
            title: module.title,
          })),
      },
    },
    include: {
      modules: true,
    },
  });
}

// Delete Course
export async function deleteCourse(id) {
  // await requirePermission("courses_delete");
  // CourseModule has onDelete: Cascade, so modules go automatically.
  // Payment/Subscription/CourseEnrollment all use onDelete: Restrict
  // on the course relation — Prisma will throw if any of those rows
  // still reference this course. That's intentional: you shouldn't
  // be able to delete a course someone has paid for or subscribed to
  // without dealing with that first (refund, archive, etc).
  const { session } = await requirePermission("courses_delete");
  const tenantId = session.user.tenantId;
  return prisma.course.delete({
    where: {
      id: Number(id),
      tenantId,
    },
    include: {
      modules: true,
    },
  });
}

// Toggle Published
export async function togglePublished(id) {
  // await requirePermission("courses_update");
  const { session } = await requirePermission("courses_update");
  const tenantId = session.user.tenantId;
  const existingCourse = await prisma.course.findUnique({
    where: {
      id: Number(id),
      tenantId,
    },
  });
  if (!existingCourse) {
    throw new Error("Course not found");
  }
  return prisma.course.update({
    where: {
      id: Number(id),
    },
    data: {
      isPublished: !existingCourse.isPublished,
    },
  });
}

// public courses
export async function getPublicCourses() {
  // find all published courses
  return prisma.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      modules: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
}

// update course order
export async function updateCourseOrder(courses) {
  // await requirePermission("courses_update");
  const { session } = await requirePermission("courses_update");
  const tenantId = session.user.tenantId;
  const updates = courses.map((course, index) =>
    prisma.course.update({
      where: {
        id: Number(course.id),
        tenantId,
      },
      data: {
        sortOrder: index,
      },
    }),
  );
  return prisma.$transaction(updates);
}

// ── Public: get full course detail (pricing + content merged) ─────

export async function getPublicCourseDetail(id) {
  const course = await prisma.course.findFirst({
    where: {
      id: Number(id),
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      billingCycle: true,
      thumbnail: true,
      instructor: true,
      level: true,
      durationHours: true,
      isFeatured: true,
      modules: {
        // PricingFeature — bullet list
        select: { id: true, title: true },
        orderBy: { sortOrder: "asc" },
      },
      courseContent: {
        select: {
          shortDescription: true,
          longDescription: true,
          modules: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
              sortOrder: true,
              videoType: true,
              videoUrl: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Flatten for easier frontend consumption
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    price: course.price,
    billingCycle: course.billingCycle,
    thumbnail: course.thumbnail,
    instructor: course.instructor,
    level: course.level,
    durationHours: course.durationHours,
    isFeatured: course.isFeatured,
    pricingFeatures: course.modules,
    shortDescription: course.courseContent?.shortDescription ?? "",
    longDescription: course.courseContent?.longDescription ?? "",
    curriculum: course.courseContent?.modules ?? [], // titles + duration only, no videoUrl
  };
}
