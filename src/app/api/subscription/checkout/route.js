import { createSubscriptionCheckout } from "@/src/app/lib/services/common_urls/payment.service";
import { getPlanById } from "@/src/app/lib/services/subscription/subscription.service";
// import { getPlanById } from "@/src/app/lib/services/course/subscription.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";

export const POST = asyncHandler(async (req) => {
  const session = await requireAuth(req);
  const { planId, billingCycle } = await req.json();

  const plan = await getPlanById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const hostUrl = host ? `${forwardedProto ?? "https"}://${host}` : null;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    origin ||
    hostUrl;

  if (!baseUrl) {
    throw new ApiError(
      500,
      "Unable to determine base URL for PayPal checkout. Please configure NEXT_PUBLIC_APP_URL or send a valid Origin/Host header.",
    );
  }

  const result = await createSubscriptionCheckout({
    userId: session.user.id,
    plan,
    billingCycle,
    returnUrl: `${baseUrl}/subscription/success`,
    cancelUrl: `${baseUrl}/subscription/cancel`,
  });

  return Response.json(new ApiResponse(200, result, "Checkout created"));
});
