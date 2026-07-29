import paypal from "@paypal/checkout-server-sdk";
import { prisma } from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { sendTriggerEmails } from "../../email";
import {
  createPaypalSubscription,
  cancelPaypalSubscription,
} from "../../paypal.helper";
import { buildSubscriptionCheckoutResponse } from "./paypalCheckoutResponse";
// import {
//   createPaypalSubscription,
//   cancelPaypalSubscription,
// } from "./paypal.helpers.js";

const TRIGGER_BY_TYPE = {
  PLAN: "ORDER_PLACED",
  PRODUCT: "PRODUCT_PURCHASED",
};

function paypalClient() {
  const env =
    process.env.PAYPAL_MODE === "live"
      ? new paypal.core.LiveEnvironment(
          process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET,
        )
      : new paypal.core.SandboxEnvironment(
          process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET,
        );
  return new paypal.core.PayPalHttpClient(env);
}

function buildPaymentReference(paymentType, referenceId) {
  if (!paymentType || !referenceId) return {};
  if (paymentType === "PLAN") return { planId: Number(referenceId) };
  return {};
}

export async function createPayment({
  userId,
  amount,
  currency = "USD",
  billingCycle = "LIFETIME",
  paymentType,
  referenceId,
  returnUrl,
  cancelUrl,
}) {
  if (!userId) throw new ApiError(400, "User ID is required");
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new ApiError(400, "Payment amount must be greater than zero");
  }

  const client = paypalClient();
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    application_context: {
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
    purchase_units: [
      {
        amount: {
          currency_code: currency.toUpperCase(),
          value: numericAmount.toFixed(2),
        },
        custom_id: `${userId}:${paymentType}:${referenceId ?? ""}`,
      },
    ],
  });

  const { result: order } = await client.execute(request);

  await prisma.payment.create({
    data: {
      userId: Number(userId),
      ...buildPaymentReference(paymentType, referenceId),
      billingCycle,
      paypalOrderId: order.id,
      amount: Math.round(numericAmount * 100),
      currency: currency.toUpperCase(),
      status: "PENDING",
    },
  });

  return {
    orderId: order.id,
    status: order.status,
    approvalUrl: order.links?.find((link) => link.rel === "approve")?.href,
    amount: Math.round(numericAmount * 100),
    currency: currency.toUpperCase(),
  };
}

export async function createSubscriptionCheckout({
  userId,
  plan,
  billingCycle,
  returnUrl,
  cancelUrl,
}) {
  if (!["MONTHLY", "YEARLY"].includes(billingCycle)) {
    throw new ApiError(
      400,
      "Subscription checkout only supports MONTHLY or YEARLY",
    );
  }

  const paypalPlanId =
    billingCycle === "YEARLY"
      ? plan.paypalYearlyPlanId
      : plan.paypalMonthlyPlanId;

  if (!paypalPlanId) {
    throw new ApiError(
      503,
      "This plan is temporarily unavailable for purchase. Please try again shortly.",
    );
  }

  const subscription = await createPaypalSubscription({
    paypalPlanId,
    customId: `${userId}:${plan.id}:${billingCycle}`,
    returnUrl,
    cancelUrl,
  });

  await prisma.planSubscription.upsert({
    where: { userId_planId: { userId: Number(userId), planId: plan.id } },
    update: {
      status: "PENDING",
      billingCycle,
      paypalSubscriptionId: subscription.id,
      canceledAt: null,
    },
    create: {
      userId: Number(userId),
      planId: plan.id,
      billingCycle,
      status: "PENDING",
      startsAt: new Date(),
      currentPeriodEnd: new Date(),
      paypalSubscriptionId: subscription.id,
    },
  });

  return buildSubscriptionCheckoutResponse(subscription);
}

export async function cancelUserSubscription(userId, planId) {
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

  if (subscription.paypalSubscriptionId) {
    await cancelPaypalSubscription(subscription.paypalSubscriptionId);
  }

  return prisma.planSubscription.update({
    where: { id: subscription.id },
    data: { status: "CANCELED", canceledAt: new Date() },
    include: { plan: true },
  });
}

export async function updatePaymentStatus(paypalOrderId, status) {
  return prisma.payment.updateMany({
    where: { paypalOrderId },
    data: { status },
  });
}

export async function getPayment(paypalOrderId) {
  return prisma.payment.findUnique({ where: { paypalOrderId } });
}

export async function capturePayment(orderId) {
  const client = paypalClient();
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const { result: capture } = await client.execute(request);

    if (capture.status !== "COMPLETED") {
      await updatePaymentStatus(orderId, "FAILED");
      throw new ApiError(400, "Payment not completed");
    }

    // existing success code...

    return capture;
  } catch (err) {
    await updatePaymentStatus(orderId, "FAILED");

    console.error("PayPal Capture Error:", err);

    throw new ApiError(400, err?.message || "PayPal payment failed");
  }
}

async function sendPaymentSuccessEmail(payment) {
  const paymentType = payment.planId ? "PLAN" : "PRODUCT";
  const triggerEvent = TRIGGER_BY_TYPE[paymentType];
  if (!triggerEvent) return;

  await sendTriggerEmails(triggerEvent, {
    name: payment.user?.name,
    email: payment.user?.email,
    planName: payment.plan?.title,
    amount: payment.amount / 100,
    currency: payment.currency,
    billingCycle: payment.billingCycle,
  });
}

export async function getPaymentHistory(userId) {
  return prisma.payment.findMany({
    where: { userId: Number(userId) },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
}
