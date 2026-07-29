// ═══════════════════════════════════════════════════════════
// PAYPAL BASE CONFIG
// ═══════════════════════════════════════════════════════════
const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// ═══════════════════════════════════════════════════════════
// GET OAUTH ACCESS TOKEN
// (required for every raw REST call — expires in ~9 hours,
// so we just fetch a fresh one each time; simplest + safest)
// ═══════════════════════════════════════════════════════════
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ═══════════════════════════════════════════════════════════
// GENERIC REQUEST HELPER
// ═══════════════════════════════════════════════════════════
async function paypalRequest(path, { method = "GET", body, extraHeaders = {} } = {}) {
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `PayPal API error [${res.status}] ${path}: ${JSON.stringify(data)}`,
    );
  }

  return data;
}

// ═══════════════════════════════════════════════════════════
// CREATE ONE PAYPAL PRODUCT + BILLING PLAN
// (called once per billing cycle: MONTHLY or YEARLY)
// ═══════════════════════════════════════════════════════════
async function createProductAndPlan(plan, billingCycle, price) {
  // 1. Create Product
  const product = await paypalRequest("/v1/catalogs/products", {
    method: "POST",
    body: {
      name: plan.title,
      description: plan.tagline || plan.description || undefined,
      type: "SERVICE",
      category: "SOFTWARE",
    },
  });

  // 2. Create Billing Plan tied to that product
  const billingPlan = await paypalRequest("/v1/billing/plans", {
    method: "POST",
    body: {
      product_id: product.id,
      name: `${plan.title} - ${billingCycle}`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: billingCycle === "YEARLY" ? "YEAR" : "MONTH",
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = renews forever
          pricing_scheme: {
            fixed_price: {
              value: Number(price).toFixed(2),
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
        setup_fee_failure_action: "CONTINUE",
      },
    },
  });

  return billingPlan.id;
}

// ═══════════════════════════════════════════════════════════
// PUBLIC: Create PayPal plans for whichever billing cycles
// this Plan allows and has a price set for.
// ═══════════════════════════════════════════════════════════
export async function createPaypalPlansFor(plan) {
  const update = {};

  if (plan.allowMonthly && plan.monthlyPrice) {
    update.paypalMonthlyPlanId = await createProductAndPlan(plan, "MONTHLY", plan.monthlyPrice);
  }

  if (plan.allowYearly && plan.yearlyPrice) {
    update.paypalYearlyPlanId = await createProductAndPlan(plan, "YEARLY", plan.yearlyPrice);
  }

  return update;
}

// ═══════════════════════════════════════════════════════════
// PUBLIC: Create a subscription (checkout) for a user
// ═══════════════════════════════════════════════════════════
export async function createPaypalSubscription({ paypalPlanId, customId, returnUrl, cancelUrl }) {
  const subscription = await paypalRequest("/v1/billing/subscriptions", {
    method: "POST",
    body: {
      plan_id: paypalPlanId,
      custom_id: customId,
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "SUBSCRIBE_NOW",
      },
    },
  });

  return subscription;
}

// ═══════════════════════════════════════════════════════════
// PUBLIC: Cancel a subscription
// ═══════════════════════════════════════════════════════════
export async function cancelPaypalSubscription(paypalSubscriptionId, reason = "User requested cancellation") {
  await paypalRequest(`/v1/billing/subscriptions/${paypalSubscriptionId}/cancel`, {
    method: "POST",
    body: { reason },
  });
}

// ═══════════════════════════════════════════════════════════
// PUBLIC: Verify a webhook signature (used in Step 10)
// ═══════════════════════════════════════════════════════════
export async function verifyPaypalWebhookSignature(headers, rawBody) {
  const result = await paypalRequest("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: {
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(rawBody),
    },
  });

  return result.verification_status === "SUCCESS";
}