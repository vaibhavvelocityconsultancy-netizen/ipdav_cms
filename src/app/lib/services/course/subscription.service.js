import { prisma } from "../../prisma";
import { ApiError } from "@/src/app/lib/utils/ApiError";

// ─────────────────────────────────────────────────────────────
// PLAN CRUD (admin management)
// ─────────────────────────────────────────────────────────────

export async function getAllPlans() {
  return prisma.plan.findMany({
    include: { features: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPlanById(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new ApiError(400, "Valid plan ID is required");
  }

  return prisma.plan.findUnique({
    where: { id: numericId },
    include: { features: { orderBy: { sortOrder: "asc" } } },
  });
}

async function resolveUniqueSlug(tenantId, baseSlug) {
  const sanitizedBase = (baseSlug || "plan")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const initialSlug = sanitizedBase || "plan";
  let slug = initialSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.plan.findFirst({
      where: { tenantId, slug },
      select: { id: true },
    });

    if (!existing) return slug;

    slug = `${initialSlug}-${counter}`;
    counter += 1;
  }
}

export async function createPlan(tenantId, input) {
  if (!tenantId) {
    throw new ApiError(
      401,
      "Missing tenant context — check session.user.tenantId",
    );
  }

  const { features = [], slug: _ignoredSlug, ...planData } = input;
  const baseSlug = input.slug || input.title || "plan";
  const slug = await resolveUniqueSlug(tenantId, baseSlug);

  return prisma.plan.create({
    data: {
      ...planData,
      slug,
      tenant: {
        connect: {
          id: tenantId,
        },
      },
      features: {
        create: features.map((f, i) => ({
          title: f.title,
          sortOrder: f.sortOrder ?? i,
        })),
      },
    },
    include: {
      features: true,
    },
  });
}

export async function updatePlan(id, tenantId, input) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new ApiError(400, "Valid plan ID is required");
  }

  const existingPlan = await prisma.plan.findUnique({
    where: { id: numericId, tenantId },
  });
  if (!existingPlan) throw new ApiError(404, "Plan not found");

  const { features = [], ...planData } = input;

  if (planData.slug) {
    const duplicateSlug = await prisma.plan.findFirst({
      where: { slug: planData.slug, NOT: { id: Number(id) } },
    });
    if (duplicateSlug) {
      throw new ApiError(
        409,
        `Slug "${planData.slug}" is already used by another plan`,
      );
    }
  }

  const incomingFeatureIds = features
    .filter((f) => f.id)
    .map((f) => Number(f.id));

  await prisma.planFeature.deleteMany({
    where: { planId: numericId, id: { notIn: incomingFeatureIds } },
  });

  return prisma.plan.update({
    where: { id: numericId },
    data: {
      ...planData,
      features: {
        update: features
          .filter((f) => f.id)
          .map((f) => ({
            where: { id: Number(f.id) },
            data: { title: f.title, sortOrder: f.sortOrder },
          })),
        create: features
          .filter((f) => !f.id)
          .map((f, i) => ({ title: f.title, sortOrder: f.sortOrder ?? i })),
      },
    },
    include: { features: true },
  });
}

export async function deletePlan(id, tenantId) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new ApiError(400, "Valid plan ID is required");
  }

  return prisma.plan.delete({
    where: { id: numericId, tenantId },
  });
}

export async function togglePlanPublished(id, tenantId) {
  const existingPlan = await prisma.plan.findUnique({
    where: { id: Number(id), tenantId },
  });
  if (!existingPlan) throw new ApiError(404, "Plan not found");

  return prisma.plan.update({
    where: { id: Number(id) },
    data: { isPublished: !existingPlan.isPublished },
  });
}

export async function updatePlanOrder(tenantId, plans) {
  const updates = plans.map((plan, index) =>
    prisma.plan.update({
      where: { id: Number(plan.id), tenantId },
      data: { sortOrder: index },
    }),
  );
  return prisma.$transaction(updates);
}

export async function getUserCurrentAccess(userId) {
  const [subscription, enrollment] = await Promise.all([
    prisma.planSubscription.findFirst({
      where: { userId: Number(userId) },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.planEnrollment.findFirst({
      where: { userId: Number(userId) },
      include: { plan: true },
      orderBy: { purchasedAt: "desc" },
    }),
  ]);

  if (enrollment) return { type: "enrollment", record: enrollment };
  if (subscription) return { type: "subscription", record: subscription };
  return { type: null, record: null };
}

export async function getPublicPlans() {
  return prisma.plan.findMany({
    where: { isPublished: true },
    include: { features: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

// ─────────────────────────────────────────────────────────────
// HELPER: computePeriodEnd
// ─────────────────────────────────────────────────────────────
// billingPeriodDays is the number of days ONE cycle covers,
// set directly by admin per plan (e.g. 30 for monthly, 365 for
// yearly) — no assumption baked in about what "a month" means.
//
// LIFETIME never creates a PlanSubscription — it goes through
// PlanEnrollment instead (see createEnrollment below).
// ─────────────────────────────────────────────────────────────

function computePeriodEnd(plan, billingCycle) {
  if (billingCycle === "LIFETIME") {
    throw new ApiError(
      500,
      "LIFETIME plans should use PlanEnrollment, not PlanSubscription",
    );
  }

  if (billingCycle !== "MONTHLY" && billingCycle !== "YEARLY") {
    throw new ApiError(400, `Unknown billing cycle: ${billingCycle}`);
  }

  if (!plan.billingPeriodDays || plan.billingPeriodDays <= 0) {
    throw new ApiError(
      500,
      `Plan "${plan.slug}" has billingCycle "${billingCycle}" but no billingPeriodDays set`,
    );
  }

  const now = new Date();
  return new Date(now.getTime() + plan.billingPeriodDays * 24 * 60 * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────
// createSubscription(userId, planId, billingCycle)
// ─────────────────────────────────────────────────────────────
// Called after successful payment for a MONTHLY or YEARLY plan.
// No trial step — status goes straight to ACTIVE.
// ─────────────────────────────────────────────────────────────

export async function createSubscription(
  userId,
  planId,
  billingCycle = "MONTHLY",
) {
  const existing = await prisma.planSubscription.findUnique({
    where: {
      userId_planId: { userId: Number(userId), planId: Number(planId) },
    },
  });

  if (existing) {
    throw new ApiError(409, "User already has a subscription to this plan.");
  }

  const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });

  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  if (!plan.isPublished) {
    throw new ApiError(400, "This plan is not currently available");
  }

  const now = new Date();
  const currentPeriodEnd = computePeriodEnd(plan, billingCycle);

  return prisma.planSubscription.create({
    data: {
      userId: Number(userId),
      planId: Number(planId),
      billingCycle,
      status: "ACTIVE",
      startsAt: now,
      currentPeriodEnd,
    },
    include: { plan: true },
  });
}

// ─────────────────────────────────────────────────────────────
// createEnrollment(userId, planId)
// ─────────────────────────────────────────────────────────────
// Called after successful payment for a LIFETIME plan.
// Permanent access record, no recurring period, no expiry.
// ─────────────────────────────────────────────────────────────

export async function createEnrollment(userId, planId) {
  const existing = await prisma.planEnrollment.findUnique({
    where: {
      userId_planId: { userId: Number(userId), planId: Number(planId) },
    },
  });

  if (existing) {
    throw new ApiError(409, "User is already enrolled in this plan.");
  }

  const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });

  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  if (!plan.isPublished) {
    throw new ApiError(400, "This plan is not currently available");
  }

  return prisma.planEnrollment.create({
    data: { userId: Number(userId), planId: Number(planId) },
    include: { plan: true },
  });
}

// ─────────────────────────────────────────────────────────────
// getUserPlanAccess(userId, planId)
// ─────────────────────────────────────────────────────────────
// Returns: { type: "subscription" | "enrollment" | null, record }
// One call so the UI knows which kind of access to render
// ("renews on X" vs "owned") without stitching two calls together.
// ─────────────────────────────────────────────────────────────

export async function getUserPlanAccess(userId, planId) {
  const [subscription, enrollment] = await Promise.all([
    prisma.planSubscription.findUnique({
      where: {
        userId_planId: { userId: Number(userId), planId: Number(planId) },
      },
      include: { plan: true },
    }),
    prisma.planEnrollment.findUnique({
      where: {
        userId_planId: { userId: Number(userId), planId: Number(planId) },
      },
      include: { plan: true },
    }),
  ]);

  if (enrollment) {
    return { type: "enrollment", record: enrollment };
  }

  if (subscription) {
    return { type: "subscription", record: subscription };
  }

  return { type: null, record: null };
}

// ─────────────────────────────────────────────────────────────
// isSubscriptionActive(userId, planId)
// ─────────────────────────────────────────────────────────────
// Never throws — enrollment is always active once it exists;
// subscription is active only if ACTIVE and not past currentPeriodEnd
// (date is source of truth, not just stored status, in case the
// cron job hasn't run yet).
// ─────────────────────────────────────────────────────────────

export async function isSubscriptionActive(userId, planId) {
  const access = await getUserPlanAccess(userId, planId);

  if (access.type === "enrollment") {
    return true;
  }

  if (access.type === "subscription") {
    const subscription = access.record;
    const now = new Date();

    switch (subscription.status) {
      case "CANCELED":
      case "EXPIRED":
        return false;
      case "ACTIVE":
        return subscription.currentPeriodEnd > now;
      default:
        return false;
    }
  }

  return false;
}

// ─────────────────────────────────────────────────────────────
// cancelSubscription(userId, planId)
// ─────────────────────────────────────────────────────────────
// Marks CANCELED, doesn't delete — keeps history. User keeps
// access until currentPeriodEnd, same as Stripe/Netflix pattern.
// Only applies to recurring subscriptions, not lifetime enrollments.
// ─────────────────────────────────────────────────────────────

export async function cancelSubscription(userId, planId) {
  const subscription = await prisma.planSubscription.findUnique({
    where: {
      userId_planId: { userId: Number(userId), planId: Number(planId) },
    },
  });

  if (!subscription) {
    throw new ApiError(404, "No subscription found for this user and plan");
  }

  if (subscription.status === "CANCELED") {
    throw new ApiError(400, "Subscription is already canceled");
  }

  if (subscription.status === "EXPIRED") {
    throw new ApiError(400, "Subscription has already expired");
  }

  return prisma.planSubscription.update({
    where: {
      userId_planId: { userId: Number(userId), planId: Number(planId) },
    },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
    include: { plan: true },
  });
}

// ─────────────────────────────────────────────────────────────
// expireSubscriptions()
// ─────────────────────────────────────────────────────────────
// Meant to be called by a cron job. ACTIVE → EXPIRED when
// currentPeriodEnd has passed. Enrollments never touched.
// ─────────────────────────────────────────────────────────────

export async function expireSubscriptions() {
  const now = new Date();

  const result = await prisma.planSubscription.updateMany({
    where: { status: "ACTIVE", currentPeriodEnd: { lte: now } },
    data: { status: "EXPIRED" },
  });

  return { expiredTotal: result.count, processedAt: now };
}

// ─────────────────────────────────────────────────────────────
// requireActiveSubscription(userId, planId)
// ─────────────────────────────────────────────────────────────
// Access guard — throws if user lacks valid access via either
// a PlanSubscription or a PlanEnrollment. Use inside routes
// serving gated content.
// ─────────────────────────────────────────────────────────────

export async function requireActiveSubscription(userId, planId) {
  const access = await getUserPlanAccess(userId, planId);

  if (access.type === "enrollment") {
    return access;
  }

  if (access.type === "subscription") {
    const subscription = access.record;
    const now = new Date();

    if (subscription.status === "CANCELED") {
      throw new ApiError(
        403,
        "Your subscription to this plan has been canceled.",
      );
    }

    if (subscription.status === "EXPIRED") {
      throw new ApiError(
        403,
        "Your subscription to this plan has expired. Please renew.",
      );
    }

    if (
      subscription.status === "ACTIVE" &&
      subscription.currentPeriodEnd > now
    ) {
      return access;
    }

    throw new ApiError(
      403,
      "Your subscription to this plan has expired. Please renew.",
    );
  }

  throw new ApiError(
    403,
    "You don't have access to this plan. Please purchase or subscribe.",
  );
}
