import { prisma } from "../../prisma.js";
import { requirePermission } from "../../withPermission.js";

// ──────────────────────────────────────────────
// DASHBOARD DATA
// ──────────────────────────────────────────────
export async function getDashboardData() {
  const { session } = await requirePermission("posts_view");
  const tenantId = session.user.tenantId;

  const [
    pagesCount,
    postStatusCounts,
    categoriesCount,
    tagsCount,
    menusCount,
    recentPages,
    recentPosts,
  ] = await prisma.$transaction([
    prisma.page.count({ where: { tenantId } }),

    prisma.post.groupBy({
      by: ["status"],
      where: { tenantId },
      _count: { _all: true },
    }),

    prisma.category.count({ where: { tenantId } }),

    prisma.tag.count({ where: { tenantId } }),

    prisma.menu.count({ where: { tenantId } }),

    prisma.page.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    }),

    prisma.post.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  const postCountsByStatus = Object.fromEntries(
    postStatusCounts.map((count) => [count.status, count._count._all]),
  );
  const draftPostsCount = postCountsByStatus.DRAFT ?? 0;
  const publishedPostsCount = postCountsByStatus.PUBLISHED ?? 0;
  const postsCount = draftPostsCount + publishedPostsCount;

  return {
    stats: {
      pages: pagesCount,
      posts: postsCount,
      draftPosts: draftPostsCount,
      publishedPosts: publishedPostsCount,
      categories: categoriesCount,
      tags: tagsCount,
      menus: menusCount,
    },

    recentPages,
    recentPosts,
  };
}

export async function getSubscriberDashboard(userId) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      userId: Number(userId),
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          instructor: true,
          level: true,
          billingCycle: true,
          price: true,
        },
      },
    },
    orderBy: {
      purchasedAt: "desc",
    },
  });

  const courses = enrollments.map((enrollment) => ({
    enrollmentId: enrollment.id,
    purchasedAt: enrollment.purchasedAt,
    billingCycle: enrollment.billingCycle,
    ...enrollment.course,
  }));

  return {
    stats: {
      enrolledCourses: courses.length,
      activeCourses: courses.length,
      completedCourses: 0, // later
    },
    continueLearning: courses[0] || null,
    recentPurchases: courses.slice(0, 5),
    courses,
  };
}
