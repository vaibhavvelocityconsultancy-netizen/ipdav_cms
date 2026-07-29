import { prisma } from "./prisma.js";

const seenWebhookEvents = new Map();
const WEBHOOK_EVENT_TTL_MS = 24 * 60 * 60 * 1000;

function normalizeStatus(status) {
  switch (status) {
    case "ACTIVE":
    case "PENDING":
    case "TRIAL":
    case "PAST_DUE":
    case "EXPIRED":
    case "CANCELED":
      return status;
    default:
      return null;
  }
}

async function isDuplicateWebhook(prismaClient, eventId) {
  const cached = seenWebhookEvents.get(eventId);
  if (cached) {
    const now = Date.now();
    if (now - cached > WEBHOOK_EVENT_TTL_MS) {
      seenWebhookEvents.delete(eventId);
    } else {
      return true;
    }
  }

  const existing = await prismaClient.paypalWebhookEvent?.findUnique({
    where: { eventId },
  });

  if (existing) {
    seenWebhookEvents.set(eventId, Date.now());
    return true;
  }

  return false;
}

async function recordWebhookEvent(prismaClient, event) {
  seenWebhookEvents.set(event.id, Date.now());

  if (!prismaClient.paypalWebhookEvent) return;

  await prismaClient.paypalWebhookEvent.create({
    data: {
      eventId: event.id,
      eventType: event.event_type,
      status: "RECEIVED",
      payload: event,
    },
  });
}

export async function processPaypalWebhookEvent({
  event,
  prisma: prismaClient = prisma,
}) {
  if (!event?.id) {
    return { handled: false, duplicate: false };
  }

  if (await isDuplicateWebhook(prismaClient, event.id)) {
    return { handled: false, duplicate: true };
  }

  await recordWebhookEvent(prismaClient, event);

  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const paypalSubscriptionId = event.resource?.id;
      const nextBilling = event.resource?.billing_info?.next_billing_time;
      if (paypalSubscriptionId) {
        await prismaClient.planSubscription.updateMany({
          where: { paypalSubscriptionId },
          data: {
            status: "ACTIVE",
            startsAt: new Date(),
            currentPeriodEnd: nextBilling ? new Date(nextBilling) : undefined,
            trialEndsAt: null,
            canceledAt: null,
          },
        });
      }
      return { handled: true, duplicate: false };
    }

    case "BILLING.SUBSCRIPTION.CANCELLED": {
      const paypalSubscriptionId = event.resource?.id;
      if (paypalSubscriptionId) {
        await prismaClient.planSubscription.updateMany({
          where: { paypalSubscriptionId },
          data: {
            status: "CANCELED",
            canceledAt: new Date(),
          },
        });
      }
      return { handled: true, duplicate: false };
    }

    case "BILLING.SUBSCRIPTION.EXPIRED": {
      const paypalSubscriptionId = event.resource?.id;
      if (paypalSubscriptionId) {
        await prismaClient.planSubscription.updateMany({
          where: { paypalSubscriptionId },
          data: {
            status: "EXPIRED",
            canceledAt: null,
          },
        });
      }
      return { handled: true, duplicate: false };
    }

    case "BILLING.SUBSCRIPTION.SUSPENDED": {
      const paypalSubscriptionId = event.resource?.id;
      if (paypalSubscriptionId) {
        await prismaClient.planSubscription.updateMany({
          where: { paypalSubscriptionId },
          data: { status: "PAST_DUE" },
        });
      }
      return { handled: true, duplicate: false };
    }

    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
      const paypalSubscriptionId = event.resource?.id;
      if (paypalSubscriptionId) {
        await prismaClient.planSubscription.updateMany({
          where: { paypalSubscriptionId },
          data: { status: "PAST_DUE" },
        });
      }
      return { handled: true, duplicate: false };
    }

    case "CHECKOUT.ORDER.APPROVED": {
      const orderId = event.resource?.id;
      if (orderId) {
        await prismaClient.payment.updateMany({
          where: { paypalOrderId: orderId },
          data: { status: "PENDING" },
        });
      }
      return { handled: true, duplicate: false };
    }

    case "PAYMENT.CAPTURE.COMPLETED": {
      const captureId = event.resource?.id;
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        await prismaClient.payment.updateMany({
          where: { paypalOrderId: orderId },
          data: {
            status: "SUCCESS",
            paypalCaptureId: captureId,
          },
        });
      }
      return { handled: true, duplicate: false };
    }

    default: {
      return { handled: false, duplicate: false };
    }
  }
}
