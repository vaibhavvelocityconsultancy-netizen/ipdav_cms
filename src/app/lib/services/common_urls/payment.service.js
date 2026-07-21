import Stripe from "stripe";
import { prisma } from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { sendTriggerEmails } from "../../email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TRIGGER_BY_TYPE = {
  PLAN: "ORDER_PLACED",
  COURSE: "COURSE_ENROLLED",
  PRODUCT: "PRODUCT_PURCHASED",
};

function buildPaymentReference(paymentType, referenceId) {
  if (!paymentType || !referenceId) return {};
  if (paymentType === "COURSE") return { courseId: Number(referenceId) };
  if (paymentType === "PLAN") return { planId: Number(referenceId) };
  return {};
}

function normalizeMetadata(metadata = {}) {
  return Object.entries(metadata).reduce((result, [key, value]) => {
    if (value !== undefined && value !== null) {
      result[key] = String(value);
    }
    return result;
  }, {});
}

export async function createPayment({
  userId,
  amount,
  currency = "INR",
  billingCycle = "LIFETIME",
  paymentType,
  referenceId,
  metadata = {},
}) {
  const amountInSmallestUnit = Math.round(Number(amount) * 100);
  const normalizedCurrency = currency.toUpperCase();

  if (!userId) throw new ApiError(400, "User ID is required");
  if (!amountInSmallestUnit || amountInSmallestUnit <= 0) {
    throw new ApiError(400, "Payment amount must be greater than zero");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: normalizedCurrency.toLowerCase(),
    metadata: normalizeMetadata({
      userId,
      paymentType,
      referenceId,
      billingCycle,
      ...metadata,
    }),
  });

  await prisma.payment.create({
    data: {
      userId: Number(userId),
      ...buildPaymentReference(paymentType, referenceId),
      billingCycle,
      stripePaymentIntentId: paymentIntent.id,
      amount: amountInSmallestUnit,
      currency: normalizedCurrency,
      status: "PENDING",
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    paymentIntent,
  };
}

export async function updatePaymentStatus(paymentIntentId, status) {
  return prisma.payment.updateMany({
    where: { stripePaymentIntentId: paymentIntentId },
    data: { status },
  });
}

export async function getPayment(paymentIntentId) {
  return prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });
}

export async function verifyPayment(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    await updatePaymentStatus(paymentIntentId, "FAILED");
    throw new ApiError(400, "Payment not completed");
  }

  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { user: true, course: true },
  });

  await updatePaymentStatus(paymentIntentId, "SUCCESS");

  const emailResult = {
    success: true,
  };

  console.log("emailResult", emailResult);

  if (payment) {
    try {
      await sendPaymentSuccessEmail(payment);
    } catch (err) {
        console.error("[Email Error]", err);
      emailResult.success = false;
      emailResult.error = err.message;
    }
  }

  return {
    paymentIntent,
    emailResult,
  };
}

async function sendPaymentSuccessEmail(payment) {
  const paymentType = payment.planId
    ? "PLAN"
    : payment.courseId
      ? "COURSE"
      : "PRODUCT";
  const triggerEvent = TRIGGER_BY_TYPE[paymentType];
  if (!triggerEvent) return;

  await sendTriggerEmails(triggerEvent, {
    name: payment.user?.name,
    email: payment.user?.email,
    planName: payment.metadata?.planName,
    courseName: payment.course?.title,
    amount: payment.amount / 100,
    currency: payment.currency,
    billingCycle: payment.billingCycle,
  });
}

export async function getPaymentHistory(userId) {
  return prisma.payment.findMany({
    where: { userId: Number(userId) },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });
}
