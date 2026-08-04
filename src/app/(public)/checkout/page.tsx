"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/src/hooks/use-current-user";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useMutation } from "@tanstack/react-query";
import { resolveAppUrl } from "@/src/lib/base-path";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const [paypalPlanId, setPaypalPlanId] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const hasStarted = useRef(false);

  const planId = searchParams.get("plan");
  const billingCycle = searchParams.get("billingCycle") || "MONTHLY";

  const buildApiUrl = (path: string) =>
    resolveAppUrl(
      path,
      typeof window !== "undefined" ? window.location.origin : "",
    );

  const confirmMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const res = await fetch(buildApiUrl("/api/subscription/confirms"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: Number(planId),
          billingCycle,
          subscriptionId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save subscription");
      }
      return data;
    },
    onSuccess: () => {
      router.replace("/subscription");
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    if (userLoading || currentUser) return;
    const checkoutUrl = `/checkout?plan=${planId ?? ""}&billingCycle=${billingCycle}`;
    router.replace(`/register?redirect=${encodeURIComponent(checkoutUrl)}`);
  }, [billingCycle, currentUser, planId, router, userLoading]);

  useEffect(() => {
    if (userLoading || !currentUser || !planId || hasStarted.current) return;
    hasStarted.current = true;

    async function fetchPlanInfo() {
      try {
        const res = await fetch(
          buildApiUrl(
            `/api/subscription/plan-info?planId=${encodeURIComponent(planId)}&billingCycle=${encodeURIComponent(billingCycle)}`,
          ),
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load plan");
        }
        setPaypalPlanId(data.data.paypalPlanId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingPlan(false);
      }
    }

    fetchPlanInfo();
  }, [currentUser, planId, billingCycle, userLoading]);

  if (userLoading || loadingPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (error || !planId || !paypalPlanId) {
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

  if (confirming || confirmMutation.isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Activating your subscription...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-muted-foreground">
        Complete your subscription
      </p>
      <div className="w-full max-w-xs">
        <PayPalButtons
          style={{ layout: "vertical" }}
          createSubscription={(data, actions) =>
            actions.subscription.create({ plan_id: paypalPlanId })
          }
          onApprove={async (data) => {
            setConfirming(true);
            await confirmMutation.mutateAsync(data.subscriptionID);
          }}
          onError={() => setError("Subscription failed. Please try again.")}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        vault: true,
        intent: "subscription",
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
  );
}
