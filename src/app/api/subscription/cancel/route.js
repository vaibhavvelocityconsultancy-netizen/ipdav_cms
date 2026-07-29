// import { cancelUserSubscription } from "@/src/app/lib/services/common_urls/payment.service";
import { cancelUserSubscription } from "@/src/app/lib/services/common_urls/payment.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";


export const POST = asyncHandler(async (req) => {
  const session = await requireAuth(req);
  const { planId } = await req.json();

  const subscription = await cancelUserSubscription(session.user.id, planId);

  return Response.json(new ApiResponse(200, subscription, "Subscription canceled successfully"));
});

// export const POST = cancelSubscriptionHandler;
// export const DELETE = cancelSubscriptionHandler;
