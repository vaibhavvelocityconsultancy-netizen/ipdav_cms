"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/src/hooks/use-current-user";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useMutation } from "@tanstack/react-query";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [error, setError] = useState("");
  const hasStarted = useRef(false);
  const [activating, setActivating] = useState(false);

  const planId = searchParams.get("plan");
  const billingCycle = searchParams.get("billingCycle") || "MONTHLY";

  useEffect(() => {
    if (userLoading || currentUser) return;
    const checkoutUrl = `/checkout?plan=${planId ?? ""}&billingCycle=${billingCycle}`;
    router.replace(`/register?redirect=${encodeURIComponent(checkoutUrl)}`);
  }, [billingCycle, currentUser, planId, router, userLoading]);

  // Just confirms plan/user are ready — actual PayPal subscription
  // is created lazily inside createSubscription() below, per PayPal's flow.
  useEffect(() => {
    if (userLoading || !currentUser || !planId || hasStarted.current) return;
    hasStarted.current = true;
    setLoadingPlan(false);
  }, [currentUser, planId, userLoading]);

  async function handleCreateSubscription() {
    const res = await fetch("/api/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: Number(planId), billingCycle }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to start checkout");
    }

    // PayPal's SDK needs the raw subscription ID here, not the approval URL
    return data.data.subscriptionId;
  }

  function handleApprove(dataFromPaypal: { subscriptionID?: string }) {
    setActivating(true);
    // No capture call needed — PayPal activates the subscription itself.
    // Your webhook (BILLING.SUBSCRIPTION.ACTIVATED) flips status to ACTIVE
    // in the background within a few seconds.
    router.replace("/subscription");
  }

  if (userLoading || loadingPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (error || !planId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-red-600">
          {error || "Missing plan ID"}
        </p>
        <button
          onClick={() => router.push("/pricing")}
          className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Back to pricing
        </button>
      </div>
    );
  }

  return (
    <>
      {activating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm text-gray-600">
              Activating your subscription...
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Complete your payment</p>
        <div className="w-full max-w-xs">
          <PayPalButtons
            style={{ layout: "vertical" }}
            createSubscription={handleCreateSubscription}
            onApprove={handleApprove}
            onError={() => setError("Payment failed. Please try again.")}
          />
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
          vault: true,          // ⚠️ REQUIRED for subscriptions
          intent: "subscription", // ⚠️ REQUIRED — switches SDK mode
        }}
      >
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <CheckoutContent />
        </Suspense>
      </PayPalScriptProvider>
    </>
  );
}