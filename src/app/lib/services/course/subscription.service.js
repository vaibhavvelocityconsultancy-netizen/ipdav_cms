import { prisma } from "../../prisma";
import { ApiError } from "@/src/app/lib/utils/ApiError";

// ─────────────────────────────────────────────────────────────
// HELPER: computePeriodEnd
// ─────────────────────────────────────────────────────────────
// Calculates when a subscription period ends based on:
//   - the course's billingPeriodDays (set by admin in CMS —
//     this is a BILLING field, separate from durationHours
//     which is just descriptive "X hours of content")
//   - the billing cycle chosen by user (monthly/yearly)
//
// billingPeriodDays is the number of days ONE cycle covers,
// regardless of whether that cycle is called MONTHLY or YEARLY.
// We don't multiply by 12 for YEARLY — the admin sets the actual
// day count for each cycle length directly (e.g. 30 for monthly,
// 365 for yearly). This avoids baking in assumptions about what
// "a month" or "a year" means in days.
//
// LIFETIME is intentionally NOT handled here — lifetime courses
// never create a Subscription row at all. They go through
// CourseEnrollment instead (see createEnrollment below). If this
// is ever called with billingCycle === "LIFETIME", that's a bug
// upstream, so we throw rather than silently fudging a fake date.
// ─────────────────────────────────────────────────────────────

function computePeriodEnd(course, billingCycle) {
  if (billingCycle === "LIFETIME") {
    throw new ApiError(
      500,
      "LIFETIME courses should use CourseEnrollment, not Subscription",
    );
  }

  if (billingCycle !== "MONTHLY" && billingCycle !== "YEARLY") {
    throw new ApiError(400, `Unknown billing cycle: ${billingCycle}`);
  }

  if (!course.billingPeriodDays || course.billingPeriodDays <= 0) {
    // Misconfigured course — admin set up a MONTHLY/YEARLY course
    // without setting how many days that period covers. Fail loud
    // rather than silently defaulting, since a wrong guess here
    // means wrong renewal dates and wrong charges.
    throw new ApiError(
      500,
      `Course "${course.slug}" has billingCycle "${billingCycle}" but no billingPeriodDays set`,
    );
  }

  const now = new Date();
  return new Date(
    now.getTime() + course.billingPeriodDays * 24 * 60 * 60 * 1000,
  );
}

// ─────────────────────────────────────────────────────────────
// createSubscription(userId, courseId, billingCycle)
// ─────────────────────────────────────────────────────────────
// Called after successful payment for a MONTHLY or YEARLY course.
// No trial step — status goes straight to ACTIVE.
//
// Flow:
//   1. Block if user already has a subscription to THIS course
//      (unique key is now [userId, courseId], not userId alone)
//   2. Fetch course (need billingPeriodDays for computePeriodEnd)
//   3. Compute currentPeriodEnd
//   4. Save and return
// ─────────────────────────────────────────────────────────────

export async function createSubscription(
  userId,
  courseId,
  billingCycle = "MONTHLY",
) {
  // ── 1. Check no existing subscription to this course ────────
  const existing = await prisma.subscription.findUnique({
    where: {
      userId_courseId: {
        userId: Number(userId),
        courseId: Number(courseId),
      },
    },
  });

  if (existing) {
    throw new ApiError(409, "User already has a subscription to this course.");
  }

  // ── 2. Fetch the course ──────────────────────────────────────
  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (!course.isPublished) {
    throw new ApiError(400, "This course is not currently available");
  }

  // ── 3. Compute period end (no trial — straight to ACTIVE) ───
  const now = new Date();
  const currentPeriodEnd = computePeriodEnd(course, billingCycle);

  // ── 4. Save to DB ─────────────────────────────────────────────
  const subscription = await prisma.subscription.create({
    data: {
      userId: Number(userId),
      courseId: Number(courseId),
      billingCycle: billingCycle,
      status: "ACTIVE",
      startsAt: now,
      currentPeriodEnd: currentPeriodEnd,
    },
    include: {
      course: true,
    },
  });

  return subscription;
}

// ─────────────────────────────────────────────────────────────
// createEnrollment(userId, courseId)
// ─────────────────────────────────────────────────────────────
// Called after successful payment for a LIFETIME course.
// This is the per-course equivalent of "buying outright" —
// no recurring period, no expiry, just a permanent access record.
// ─────────────────────────────────────────────────────────────

export async function createEnrollment(userId, courseId) {
  const existing = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: Number(userId),
        courseId: Number(courseId),
      },
    },
  });

  if (existing) {
    throw new ApiError(409, "User is already enrolled in this course.");
  }

  const course = await prisma.course.findUnique({
    where: { id: Number(courseId) },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  if (!course.isPublished) {
    throw new ApiError(400, "This course is not currently available");
  }

  return prisma.courseEnrollment.create({
    data: {
      userId: Number(userId),
      courseId: Number(courseId),
    },
    include: {
      course: true,
    },
  });
}

// ─────────────────────────────────────────────────────────────
// getUserCourseAccess(userId, courseId)
// ─────────────────────────────────────────────────────────────
// Fetches whichever access record exists for this user+course —
// a Subscription, a CourseEnrollment, or neither.
//
// Returns: { type: "subscription" | "enrollment" | null, record }
//
// Why one function for both?
//   Every UI that asks "does this user have this course" needs
//   to know which one to render (e.g. show "renews on X" for a
//   subscription vs "owned" for an enrollment) without making
//   two separate calls and stitching the result together itself.
// ─────────────────────────────────────────────────────────────

export async function getUserCourseAccess(userId, courseId) {
  const [subscription, enrollment] = await Promise.all([
    prisma.subscription.findUnique({
      where: {
        userId_courseId: {
          userId: Number(userId),
          courseId: Number(courseId),
        },
      },
      include: { course: true },
    }),
    prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: Number(userId),
          courseId: Number(courseId),
        },
      },
      include: { course: true },
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
// isSubscriptionActive(userId, courseId)
// ─────────────────────────────────────────────────────────────
// Returns true/false — never throws.
// Checks BOTH access paths:
//   - CourseEnrollment (lifetime) → always active once it exists,
//     there's nothing to expire
//   - Subscription (monthly/yearly) → active only if status is
//     ACTIVE and currentPeriodEnd hasn't passed (date is always
//     the source of truth, not just the stored status, since a
//     cron job may not have run yet)
// ─────────────────────────────────────────────────────────────

export async function isSubscriptionActive(userId, courseId) {
  const access = await getUserCourseAccess(userId, courseId);

  if (access.type === "enrollment") {
    // Lifetime access never expires
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

  // No access record of either kind
  return false;
}

// ─────────────────────────────────────────────────────────────
// cancelSubscription(userId, courseId)
// ─────────────────────────────────────────────────────────────
// Marks the subscription to a specific course as CANCELED.
// Does NOT delete the record — we keep history.
//
// Only applies to recurring Subscriptions. Lifetime enrollments
// can't be "canceled" in this sense — there's no recurring charge
// to stop. If you need refund/revoke logic for enrollments, that's
// a separate function, not this one.
//
// User still has access until currentPeriodEnd (matches how
// Stripe/Netflix etc work — cancel now, keep access till period end).
// ─────────────────────────────────────────────────────────────

export async function cancelSubscription(userId, courseId) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      userId_courseId: {
        userId: Number(userId),
        courseId: Number(courseId),
      },
    },
  });

  if (!subscription) {
    throw new ApiError(404, "No subscription found for this user and course");
  }

  if (subscription.status === "CANCELED") {
    throw new ApiError(400, "Subscription is already canceled");
  }

  if (subscription.status === "EXPIRED") {
    throw new ApiError(400, "Subscription has already expired");
  }

  const updated = await prisma.subscription.update({
    where: {
      userId_courseId: {
        userId: Number(userId),
        courseId: Number(courseId),
      },
    },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
      // currentPeriodEnd stays as-is — user keeps access until then
    },
    include: {
      course: true,
    },
  });

  return updated;
}

// ─────────────────────────────────────────────────────────────
// expireSubscriptions()
// ─────────────────────────────────────────────────────────────
// Meant to be called by a cron job (Vercel cron / external scheduler).
//
// With trials removed, there's only one transition left:
//   ACTIVE → EXPIRED, when currentPeriodEnd has passed.
//
// CourseEnrollments are never touched here — lifetime access
// doesn't expire.
// ─────────────────────────────────────────────────────────────

export async function expireSubscriptions() {
  const now = new Date();

  const result = await prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      currentPeriodEnd: { lte: now },
    },
    data: {
      status: "EXPIRED",
    },
  });

  return {
    expiredTotal: result.count,
    processedAt: now,
  };
}

// ─────────────────────────────────────────────────────────────
// requireActiveSubscription(userId, courseId)
// ─────────────────────────────────────────────────────────────
// Access guard — throws ApiError if the user doesn't have valid
// access to this course, via EITHER a Subscription or a
// CourseEnrollment. Use this inside any API route that serves
// course/lesson content.
//
// Usage in a protected route:
//   const access = await requireActiveSubscription(user.id, courseId)
//   // access.type tells you "subscription" or "enrollment"
//   // access.record has the full row (course included)
//
// Why return access instead of throwing only?
//   Callers often need to know which kind of access this is —
//   e.g. to show "renews on X" vs "owned" in the UI — right after
//   the check, without a second DB call.
// ─────────────────────────────────────────────────────────────

export async function requireActiveSubscription(userId, courseId) {
  const access = await getUserCourseAccess(userId, courseId);

  if (access.type === "enrollment") {
    // Lifetime access — always valid once the row exists
    return access;
  }

  if (access.type === "subscription") {
    const subscription = access.record;
    const now = new Date();

    if (subscription.status === "CANCELED") {
      throw new ApiError(
        403,
        "Your subscription to this course has been canceled.",
      );
    }

    if (subscription.status === "EXPIRED") {
      throw new ApiError(
        403,
        "Your subscription to this course has expired. Please renew.",
      );
    }

    if (
      subscription.status === "ACTIVE" &&
      subscription.currentPeriodEnd > now
    ) {
      return access;
    }

    // Status says ACTIVE but date has passed and cron hasn't run yet
    throw new ApiError(
      403,
      "Your subscription to this course has expired. Please renew.",
    );
  }

  // No access record of either kind
  throw new ApiError(
    403,
    "You don't have access to this course. Please purchase or subscribe.",
  );
}
