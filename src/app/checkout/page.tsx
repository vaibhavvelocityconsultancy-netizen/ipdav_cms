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
  const [orderId, setOrderId] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState("");
  const hasStarted = useRef(false);
  const [capturing, setCapturing] = useState(false);

  const planId = searchParams.get("plan");
  const billingCycle = searchParams.get("billingCycle") || "MONTHLY";

  const capturePaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch("/api/payment/capture-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Payment capture failed");
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

    async function createOrder() {
      try {
        const res = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: Number(planId), billingCycle }),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to start checkout");
        }

        setOrderId(data.data.orderId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoadingOrder(false);
      }
    }

    createOrder();
  }, [currentUser, planId, billingCycle, userLoading]);

  if (userLoading || loadingOrder) {
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
      {capturePaymentMutation.isPending && (
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
            createOrder={() => Promise.resolve(orderId)}
            onApprove={() => capturePaymentMutation.mutateAsync(orderId!)}
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
          currency: "USD",
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
