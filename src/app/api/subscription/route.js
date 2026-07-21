// import {
//   cancelSubscription,
//   createSubscription,
//   getUserSubscription,
// } from "../../lib/services/subscription.service";
import {
  cancelSubscription,
  createSubscription,
  getUserCourseAccess,
} from "../../lib/services/course/subscription.service";
import { ApiError } from "../../lib/utils/ApiError";
import { ApiResponse } from "../../lib/utils/ApiResponse";
import { asyncHandler } from "../../lib/utils/asyncHandler";
import { requireAuth } from "../../lib/withPermission";

export const GET = asyncHandler(async () => {
  const { user } = await requireAuth();

  const subscription = await getUserCourseAccess(user.id, courseId);

  if (!subscription) {
    throw new ApiError(404, "No subscription found for this user");
  }

  return Response.json(
    new ApiResponse(200, subscription, "Subscription fetched successfully"),
  );
});

export const POST = asyncHandler(async (req) => {
  const { user } = await requireAuth();

  // parse and validate body
  const body = await req.json();
  const { courseId, billingCycle } = body;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }
  //   validate Billing Cycle
  const validCycle = ["MONTHLY", "YEARLY", "LIFETIME"];
  if (!validCycle.includes(billingCycle)) {
    throw new ApiError(400, "Invalid billing cycle");
  }
  let result;

  if (billingCycle === "LIFETIME") {
    result = await createEnrollment(user.id, courseId);
  } else {
    result = await createSubscription(user.id, courseId, billingCycle);
  }

  // const subscriptions = await createSubscription(user.id, planId, billingCycle);

  return Response.json(
    new ApiResponse(201, subscriptions, "Subscription created successfully"),
    { status: 201 },
  );
});

//  Delete subscrtipion

export const DELETE = asyncHandler(async () => {
  const { user } = await requireAuth();

  const { courseId } = body;

  const subscription = await cancelSubscription(user.id, courseId);

  return Response.json(
    new ApiResponse(200, subscription, "Subscription canceled successfully"),
  );
});
