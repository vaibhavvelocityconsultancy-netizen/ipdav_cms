import { createPayment } from "@/src/app/lib/services/common_urls/payment.service";
import { getPlanById } from "@/src/app/lib/services/course/subscription.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";

export const POST = asyncHandler(async (req) => {
  const { user } = await requireAuth();

  const { planId, billingCycle } = await req.json();
  if (!planId) throw new ApiError(400, "Plan ID is required");

  const plan = await getPlanById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  const order = await createPayment({
    userId: user.id,
    amount: plan.price,
    currency: "USD",
    billingCycle: billingCycle || plan.billingCycle,
    paymentType: "PLAN",
    referenceId: planId,
  });

  return Response.json(
    new ApiResponse(200, order, "Order created successfully"),
  );
});