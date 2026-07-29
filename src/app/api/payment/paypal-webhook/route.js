// import { prisma } from "@/prisma";
import { verifyPaypalWebhookSignature } from "@/src/app/lib/paypal.helper";
import { prisma } from "@/src/app/lib/prisma";
// import { verifyPaypalWebhookSignature } from "@/services/paypal.helpers";

function addCycle(date, billingCycle) {
  const d = new Date(date);
  if (billingCycle === "YEARLY") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

export async function POST(req) {
  const rawBody = await req.text();

  let isValid;
  try {
    isValid = await verifyPaypalWebhookSignature(req.headers, rawBody);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response("Signature verification error", { status: 401 });
  }

  if (!isValid) {
    console.error("Invalid PayPal webhook signature — rejecting");
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);

  try {
    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const paypalSubscriptionId = event.resource.id;
        const nextBilling = event.resource.billing_info?.next_billing_time;

        await prisma.planSubscription.updateMany({
          where: { paypalSubscriptionId },
          data: {
            status: "ACTIVE",
            startsAt: new Date(),
            currentPeriodEnd: nextBilling ? new Date(nextBilling) : undefined,
            trialEndsAt: null,
          },
        });
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        const paypalSubscriptionId = event.resource.billing_agreement_id;
        if (!paypalSubscriptionId) break;

        const sub = await prisma.planSubscription.findUnique({
          where: { paypalSubscriptionId },
        });
        if (!sub) break;

        await prisma.planSubscription.update({
          where: { id: sub.id },
          data: {
            status: "ACTIVE",
            currentPeriodEnd: addCycle(new Date(), sub.billingCycle),
          },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        await prisma.planSubscription.updateMany({
          where: { paypalSubscriptionId: event.resource.id },
          data: { status: "PAST_DUE" },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        await prisma.planSubscription.updateMany({
          where: { paypalSubscriptionId: event.resource.id },
          data: { status: "CANCELED", canceledAt: new Date() },
        });
        break;
      }

      default:
        console.log(`Unhandled PayPal webhook event: ${event.event_type}`);
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Still return 200 — PayPal retries on non-2xx, and a DB hiccup
    // shouldn't cause repeated retries for an already-logged event.
  }

  return Response.json({ received: true });
}