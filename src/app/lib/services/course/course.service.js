// courseContent.service.js
// import { prisma } from "../prisma.js";
// import { ApiError } from "../utils/ApiError.js";
// import { requirePermission } from "../withPermission.js";

import { prisma } from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { requirePermission } from "../../withPermission";
import { clearSitemapCache } from "../seo/sitemap.service";

// ── Generate slug ─────────────────────────────────────────

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Get all course content entries ─────────────────────────

// ── Get all course content entries ─────────────────────────

export async function getAllCourseContent({ withoutPricing = false } = {}) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  return prisma.courseContent.findMany({
    where: {
      tenantId,
      ...(withoutPricing ? { pricingCard: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      thumbnail: true,
      instructor: true,
      level: true,
      isPublished: true,
      createdAt: true,
      updatedAt: true,
      modules: {
        select: { id: true, title: true },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { modules: true } },
    },
  });
}
// ── Get course content by id ────────────────────────────────

export async function getCourseContentById(id) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const course = await prisma.courseContent.findFirst({
    where: { id: Number(id), tenantId },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
      },
      pricingCard: {
        include: {
          modules: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });
  if (!course) throw new ApiError(404, "Course not found");

  // Normalize Decimal → number for the client
  if (course.pricingCard?.price != null) {
    course.pricingCard.price = Number(course.pricingCard.price);
  }
  return course;
}

// ── Get course content by slug (public) ─────────────────────

export async function getCourseContentBySlug(slug, tenantId) {
  const where = tenantId !== undefined ? { slug, tenantId } : { slug };
  const course = await prisma.courseContent.findFirst({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      longDescription: true,
      thumbnail: true,
      instructor: true,
      level: true,
      isPublished: true,
      modules: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!course) throw new ApiError(404, "Course not found");
  if (!course.isPublished) throw new ApiError(403, "Course is not published");
  return course;
}

// ── Create course content ────────────────────────────────────

export async function createCourseContent(input) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const baseSlug = input.slug?.trim()
    ? generateSlug(input.slug)
    : generateSlug(input.title || "untitled-course");

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.courseContent.findFirst({ where: { slug, tenantId } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const modules = Array.isArray(input.modules) ? input.modules : [];

  const createCourse = await prisma.courseContent.create({
    data: {
      title: input.title || "Untitled Course",
      slug,
      shortDescription: input.shortDescription ?? "",
      longDescription: input.longDescription ?? "",
      thumbnail: input.thumbnail ?? "",
      instructor: input.instructor ?? "",
      level: input.level ?? "Beginner",
      isPublished: input.isPublished ?? true,
      tenantId,
      modules: {
        create: modules.map((module, index) => ({
          title: module.title,
          videoType: module.videoType ?? "URL",
          videoUrl: module.videoUrl ?? "",
          durationMinutes: module.durationMinutes ?? 0,
          sortOrder: module.sortOrder ?? index,
        })),
      },
    },
    include: {
      modules: true,
    },
  });

  await clearSitemapCache(tenantId);

  return createCourse;
}

// ── Update course content — basic info ───────────────────────

export async function updateCourseContentInfo(id, input) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;
  const {
    id: _,
    modules,
    createdAt,
    updatedAt,
    pricing, // NEW: optional pricing payload for the linked Course record
    ...data
  } = input;
  console.log("COURSE CONTENT INPUT:");
  console.dir(input, { depth: null });

  const existing = await prisma.courseContent.findFirst({
    where: { id: Number(id), tenantId },
    include: { pricingCard: true },
  });
  if (!existing) throw new ApiError(404, "Course not found");

  if (data.slug) {
    data.slug = generateSlug(data.slug);
    const duplicate = await prisma.courseContent.findFirst({
      where: { slug: data.slug, tenantId },
    });
    if (duplicate && duplicate.id !== Number(id)) {
      throw new ApiError(400, `Slug "${data.slug}" is already taken`);
    }
  }

  const updateCourse = await prisma.courseContent.update({
    where: { id: Number(id), tenantId },
    data,
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  // ── Upsert the linked pricing card (Course) if pricing payload is present ──
  if (pricing && typeof pricing === "object") {
    const priceValue =
      pricing.price === undefined || pricing.price === null || pricing.price === ""
        ? 0
        : Number(pricing.price);

    const pricingData = {
      title: updateCourse.title,
      slug: updateCourse.slug,
      shortDescription: updateCourse.shortDescription ?? "",
      instructor: updateCourse.instructor ?? "",
      thumbnail: updateCourse.thumbnail ?? "",
      level: updateCourse.level ?? "Beginner",
      price: priceValue,
      billingCycle: pricing.billingCycle ?? "LIFETIME",
      durationHours:
        pricing.durationHours === undefined || pricing.durationHours === null
          ? null
          : Number(pricing.durationHours),
      isFeatured: Boolean(pricing.isFeatured),
      isPublished:
        pricing.isPublished === undefined ? true : Boolean(pricing.isPublished),
    };

    if (existing.pricingCard) {
      // Update existing pricing card — slug conflict check against OTHER courses
      if (pricingData.slug) {
        const duplicateSlug = await prisma.course.findFirst({
          where: {
            slug: pricingData.slug,
            tenantId,
            NOT: { id: existing.pricingCard.id },
          },
        });
        if (duplicateSlug) {
          // fall back to appending id if slug taken
          pricingData.slug = `${pricingData.slug}-${existing.pricingCard.id}`;
        }
      }
      await prisma.course.update({
        where: { id: existing.pricingCard.id },
        data: pricingData,
      });
    } else {
      // Create pricing card — ensure unique slug for Course scope
      let courseSlug = pricingData.slug;
      let counter = 1;
      while (
        await prisma.course.findFirst({ where: { slug: courseSlug, tenantId } })
      ) {
        courseSlug = `${pricingData.slug}-${counter++}`;
      }
      await prisma.course.create({
        data: {
          ...pricingData,
          slug: courseSlug,
          tenantId,
          courseContentId: Number(id),
        },
      });
    }
  }

  await clearSitemapCache(tenantId);

  // Re-fetch with pricingCard for the response
  const finalCourse = await prisma.courseContent.findFirst({
    where: { id: Number(id), tenantId },
    include: {
      modules: { orderBy: { sortOrder: "asc" } },
      pricingCard: {
        include: { modules: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (finalCourse?.pricingCard?.price != null) {
    finalCourse.pricingCard.price = Number(finalCourse.pricingCard.price);
  }
  return finalCourse;
}

// ── Update course content — videos/modules (nested) ──────────

export async function updateCourseModules(id, modules = []) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const existing = await prisma.courseContent.findFirst({
    where: { id: Number(id), tenantId },
  });
  if (!existing) throw new ApiError(404, "Course not found");

  const incomingModuleIds = modules
    .filter((module) => module.id)
    .map((module) => Number(module.id));

  await prisma.courseModule.deleteMany({
    where: {
      courseContentId: Number(id),
      id: { notIn: incomingModuleIds },
    },
  });

  const updateCouseModule = await prisma.courseContent.update({
    where: { id: Number(id), tenantId },
    data: {
      modules: {
        update: modules
          .filter((module) => module.id)
          .map((module) => ({
            where: { id: Number(module.id) },
            data: {
              title: module.title,
              videoType: module.videoType,
              videoUrl: module.videoUrl,
              durationMinutes: module.durationMinutes,
              sortOrder: module.sortOrder,
            },
          })),
        create: modules
          .filter((module) => !module.id)
          .map((module, index) => ({
            title: module.title,
            videoType: module.videoType ?? "URL",
            videoUrl: module.videoUrl ?? "",
            durationMinutes: module.durationMinutes ?? 0,
            sortOrder: module.sortOrder ?? index,
          })),
      },
    },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  await clearSitemapCache(tenantId);

  return updateCouseModule;
}

// ── Toggle published ──────────────────────────────────────────

export async function toggleCourseContentPublished(id) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const existing = await prisma.courseContent.findFirst({
    where: { id: Number(id), tenantId },
  });
  if (!existing) throw new ApiError(404, "Course not found");

  const toggleCourseContent = await prisma.courseContent.update({
    where: { id: Number(id), tenantId },
    data: { isPublished: !existing.isPublished },
  });

  await clearSitemapCache(tenantId);

  return toggleCourseContent;
}

// ── Delete course content ───────────────────────────────────────

export async function deleteCourseContent(id) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const existing = await prisma.courseContent.findFirst({
    where: { id: Number(id), tenantId },
  });
  if (!existing) throw new ApiError(404, "Course not found");

  // CourseModule has onDelete: Cascade on courseContentId, so modules go automatically
  const courseContentDelete = await prisma.courseContent.delete({
    where: { id: Number(id) },
    include: { modules: true },
  });

  await clearSitemapCache(tenantId);

  return courseContentDelete;
}

// ── Public: list published courses ──────────────────────────────

export async function getPublicCourseContent(tenantId) {
  const where =
    tenantId !== undefined
      ? { isPublished: true, tenantId }
      : { isPublished: true };

  const publiccontnet = await prisma.courseContent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      thumbnail: true,
      instructor: true,
      level: true,
      modules: {
        select: { id: true, durationMinutes: true },
      },
    },
  });

  return publiccontnet;
}
