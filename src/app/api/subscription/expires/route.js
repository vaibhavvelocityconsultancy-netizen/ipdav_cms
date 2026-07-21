import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";

// expires/route.js
export const POST = asyncHandler(async (req) => {
  const { user } = await requireAuth();

  const subscription = await getSubscriptionExpiry(user.id);

  return Response.json(
    new ApiResponse(200, subscription, "Subscription fetched successfully"),
  );
});
