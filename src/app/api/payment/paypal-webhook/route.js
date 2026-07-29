import { verifyPaypalWebhookSignature } from "@/src/app/lib/paypal.helper";
import { prisma } from "@/src/app/lib/prisma";
import { processPaypalWebhookEvent } from "@/src/app/lib/paypalWebhookHandler";

function parseBody(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch (error) {
    throw new Error("Invalid JSON payload");
  }
}

export async function POST(req) {
  const rawBody = await req.text();

  let event;
  try {
    event = parseBody(rawBody);
  } catch (error) {
    console.error("Webhook payload parse error:", error.message);
    return new Response("Invalid payload", { status: 400 });
  }

  let isValid;
  try {
    isValid = await verifyPaypalWebhookSignature(req.headers, rawBody);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return new Response("Signature verification error", { status: 401 });
  }

  if (!isValid) {
    console.error("Invalid PayPal webhook signature — rejecting");
    return new Response("Invalid signature", { status: 401 });
  }

  try {
    const result = await processPaypalWebhookEvent({ event, prisma });

    if (result.duplicate) {
      return Response.json(
        { received: true, duplicate: true },
        { status: 200 },
      );
    }

    if (result.handled) {
      return Response.json({ received: true }, { status: 200 });
    }

    return Response.json({ received: true, ignored: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}
