import { cancelSubscription } from "@/src/app/lib/services/course/subscription.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";

export const DELETE = asyncHandler(async (req) => {
  const { user } = await requireAuth();

  // parse and validate body
  const body = await req.json();
  const { courseId } = body;
  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }
  // call service to cancel subscription
  const subscription = await cancelSubscription(user.id, courseId);
  // if (!subscription) {
  //     return Response.json({ error: "Subscription not found" }, { status: 404 });
  // }
  return Response.json(
    new ApiResponse(200, subscription, "Subscription canceled successfully"),
  );
});
