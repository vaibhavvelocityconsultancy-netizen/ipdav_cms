import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { processPaypalWebhookEvent } =
  await import("../src/app/lib/paypalWebhookHandler.js");

const prismaModulePath = "../src/app/lib/prisma.js";
const prismaStub = { planSubscription: {}, payment: {}, webhookEvent: {} };

const originalPrismaModule = await import(prismaModulePath).catch(() => null);
if (originalPrismaModule) {
  const { prisma } = originalPrismaModule;
  if (prisma) {
    prismaStub.planSubscription = prisma.planSubscription;
    prismaStub.payment = prisma.payment;
    prismaStub.webhookEvent = prisma.webhookEvent;
  }
}

test("activates subscriptions only from activation events and ignores duplicate deliveries", async () => {
  const updates = [];
  const createdEvents = [];

  const prisma = {
    webhookEvent: {
      async findUnique({ where }) {
        return createdEvents.includes(where.eventId)
          ? { id: where.eventId }
          : null;
      },
      async create({ data }) {
        createdEvents.push(data.eventId);
        return { id: data.eventId };
      },
    },
    planSubscription: {
      async updateMany({ where, data }) {
        updates.push({ type: "subscription", where, data });
        return { count: 1 };
      },
    },
    payment: {
      async findFirst() {
        return null;
      },
      async updateMany({ where, data }) {
        updates.push({ type: "payment", where, data });
        return { count: 1 };
      },
    },
  };

  const activationEvent = {
    id: "evt_activation",
    event_type: "BILLING.SUBSCRIPTION.ACTIVATED",
    resource: {
      id: "sub_123",
      billing_info: { next_billing_time: "2026-08-29T00:00:00Z" },
    },
  };

  const firstResult = await processPaypalWebhookEvent({
    event: activationEvent,
    prisma,
  });
  assert.equal(firstResult.duplicate, false);
  assert.equal(firstResult.handled, true);
  assert.equal(
    updates.some((update) => update.data.status === "ACTIVE"),
    true,
  );

  const duplicateResult = await processPaypalWebhookEvent({
    event: activationEvent,
    prisma,
  });
  assert.equal(duplicateResult.duplicate, true);
  assert.equal(duplicateResult.handled, false);
});

test("marks one-time payments as successful on capture completion", async () => {
  const updates = [];
  const createdEvents = [];

  const prisma = {
    webhookEvent: {
      async findUnique({ where }) {
        return createdEvents.includes(where.eventId)
          ? { id: where.eventId }
          : null;
      },
      async create({ data }) {
        createdEvents.push(data.eventId);
        return { id: data.eventId };
      },
    },
    payment: {
      async findFirst({ where }) {
        if (where.OR?.[0]?.paypalOrderId === "order_123") {
          return { id: "pay_1" };
        }
        return null;
      },
      async updateMany({ where, data }) {
        updates.push({ where, data });
        return { count: 1 };
      },
    },
    planSubscription: {
      async updateMany() {
        return { count: 0 };
      },
    },
  };

  const captureEvent = {
    id: "evt_capture",
    event_type: "PAYMENT.CAPTURE.COMPLETED",
    resource: {
      id: "cap_123",
      supplementary_data: {
        related_ids: {
          order_id: "order_123",
        },
      },
    },
  };

  const result = await processPaypalWebhookEvent({
    event: captureEvent,
    prisma,
  });
  assert.equal(result.handled, true);
  assert.equal(updates[0].data.status, "SUCCESS");
  assert.equal(updates[0].data.paypalCaptureId, "cap_123");
});
