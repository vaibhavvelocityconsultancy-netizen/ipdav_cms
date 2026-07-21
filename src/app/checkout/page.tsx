"use client";

export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Loader2, BookOpen, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCurrentUser } from "@/src/hooks/use-current-user";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

function CheckoutForm({
  courseInfo,
  courseId,
  billingCycle,
}: {
  courseInfo: { courseName: string; amount: number } | null;
  courseId: string | null;
  billingCycle: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription/courses`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Payment failed");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          courseId,
          billingCycle,
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        router.push("/subscription/courses");
      } else {
        setError("Payment verification failed. Contact support.");
      }
    }

    setLoading(false);
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-5">
      {/* Course summary */}
      <div className="flex items-start gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {courseInfo?.courseName || "Loading..."}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
            {billingCycle.toLowerCase()} access
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="text-xl font-bold text-foreground">
          {courseInfo ? `₹${courseInfo.amount.toLocaleString("en-IN")}` : "—"}
        </span>
      </div>

      {/* Payment Element */}
      <div className="rounded-md border border-border px-3 py-3 bg-background">
        <PaymentElement />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={loading || !courseInfo || !stripe}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Processing..." : "Pay Now"}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5" />
        Secured by Stripe
      </div>
    </div>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const courseId = searchParams.get("course");
  const billingCycle = searchParams.get("billingCycle") || "LIFETIME";

  useEffect(() => {
    if (userLoading || currentUser) return;

    const checkoutUrl = `/checkout?course=${courseId ?? ""}&billingCycle=${billingCycle}`;
    router.replace(`/register?redirect=${encodeURIComponent(checkoutUrl)}`);
  }, [billingCycle, courseId, currentUser, router, userLoading]);

  // Fetch course info
  const {
    data: courseInfo,
    isLoading: courseLoading,
    isError: courseError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      if (!data?.data) throw new Error("Course not found");
      return {
        courseName: data.data.title,
        amount: data.data.price,
      };
    },
    enabled: !!courseId && !!currentUser,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Create payment intent
  const {
    data: orderData,
    isLoading: orderLoading,
    isError: orderError,
  } = useQuery({
    queryKey: ["create-order", courseId, billingCycle],
    queryFn: async () => {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, billingCycle }),
      });
      const data = await res.json();
      if (!data?.data?.clientSecret) throw new Error("Failed to create order");
      return data.data;
    },
    enabled: !!courseId && !!currentUser,
    staleTime: Infinity, // never refetch — each call creates a new PaymentIntent
    retry: 1,
  });

  const isLoading = userLoading || courseLoading || orderLoading;
  const isError = courseError || orderError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !courseId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-red-600">
          Failed to load checkout
        </p>
        <button
          onClick={() => router.back()}
          className="text-xs font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!stripePublishableKey) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <section className="w-full max-w-sm">
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <h1 className="text-xl font-semibold text-foreground">
              Stripe is not configured
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The checkout page requires NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to
              be set.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <section className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete your enrollment
          </p>
        </div>

        {orderData?.clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: orderData.clientSecret }}
          >
            <CheckoutForm
              courseInfo={courseInfo ?? null}
              courseId={courseId}
              billingCycle={billingCycle}
            />
          </Elements>
        ) : (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
