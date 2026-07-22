import { expireSubscriptions } from "@/src/app/lib/services/course/subscription.service";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";

// expires/route.js
export const POST = asyncHandler(async (req) => {
  const { user } = await requireAuth();

  const subscription = await expireSubscriptions(user.id);

  return Response.json(
    new ApiResponse(200, subscription, "Subscription expired successfully"),
  );
});
