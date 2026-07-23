import { prisma } from "../../prisma.js";
import { requirePermission } from "../../withPermission.js";
import { getUserCurrentAccess } from "../course/subscription.service.js";

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
  const access = await getUserCurrentAccess(userId);

  const { type, record } = access;
  const plan = record?.plan ?? null;
  const now = Date.now();

  const isTrialExpired =
    type === "subscription" &&
    record?.status === "TRIALING" &&
    record?.trialEndsAt &&
    new Date(record.trialEndsAt).getTime() <= now;

  const normalizedStatus = isTrialExpired
    ? "EXPIRED"
    : (record?.status ?? null);

  let trialDaysRemaining = null;
  if (
    type === "subscription" &&
    normalizedStatus === "TRIALING" &&
    record?.trialEndsAt
  ) {
    const end = new Date(record.trialEndsAt).getTime();
    trialDaysRemaining = Math.max(
      0,
      Math.floor((end - now) / (1000 * 60 * 60 * 24)),
    );
  }

  return {
    accessType: type, // "subscription" | "enrollment" | null
    plan: plan
      ? {
          id: plan.id,
          title: plan.title,
          price: plan.price,
          billingCycle: record.billingCycle,
        }
      : null,
    status: normalizedStatus, // TRIALING | ACTIVE | EXPIRED | CANCELED (enrollment has no status)
    trialDaysRemaining,
    trialEndsAt: record?.trialEndsAt ?? null,
    currentPeriodEnd: record?.currentPeriodEnd ?? null,
    startsAt: record?.startsAt ?? record?.purchasedAt ?? null,
  };
}
