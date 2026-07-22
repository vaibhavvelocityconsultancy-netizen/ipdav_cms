"use client";

import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import useSWR from "swr";
import { fetchers } from "../../lib/fetchers";
import { useCurrentUser } from "@/src/hooks/use-current-user";

type BillingCycle = "LIFETIME" | "MONTHLY" | "YEARLY";

function formatINR(val: number) {
  if (val === 0) return "Free";
  return "$" + val.toLocaleString("en-IN");
}

function accessTypeLabel(billingCycle: BillingCycle) {
  if (billingCycle === "LIFETIME") return "Lifetime Access";
  if (billingCycle === "MONTHLY") return "Monthly Subscription";
  if (billingCycle === "YEARLY") return "Yearly Subscription";
  return billingCycle;
}

export default function PricingPlansPage() {
  const router = useRouter();
  const { data, isLoading } = useSWR("plans", fetchers.publicPlans);
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const plans = data?.data ?? [];

  function handleSelectPlan(planId: number, billingCycle: BillingCycle) {
    if (userLoading) return;

    const checkoutUrl = `/checkout?plan=${planId}&billingCycle=${billingCycle}`;

    if (!currentUser) {
      router.push(`/register?redirect=${encodeURIComponent(checkoutUrl)}`);
      return;
    }

    router.push(checkoutUrl);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">No plans available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="relative px-4 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Choose your plan
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Pick the plan that fits you — cancel or switch anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const dark = plan.isFeatured;
            return (
              <div
                key={plan.id}
                className={`relative w-full rounded-none overflow-hidden flex flex-col border-t-4 ${
                  dark
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-slate-50 border-slate-900 text-slate-900"
                }`}
              >
                <div className="p-8 flex flex-col flex-grow">
                  <h3
                    className={`font-serif text-5xl mb-3 ${
                      dark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {plan.title}
                  </h3>
                  <p
                    className={`text-sm mb-6 ${
                      dark ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="font-serif text-6xl">
                      {formatINR(plan.price)}
                    </span>
                    <span
                      className={`text-lg ${
                        dark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      / {accessTypeLabel(plan.billingCycle)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id, plan.billingCycle)}
                    disabled={userLoading}
                    className={`w-full py-3 text-sm font-medium mb-6 disabled:opacity-60 ${
                      dark
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {userLoading ? "Checking..." : "Create Free Trial"}
                  </button>

                  <div
                    className={`border-t mb-6 ${
                      dark ? "border-slate-700" : "border-slate-300"
                    }`}
                  />

                  {plan.features?.length > 0 && (
                    <div className="flex-grow space-y-3">
                      {plan.features.map((f) => (
                        <div key={f.id} className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 h-4 w-4 border flex items-center justify-center mt-0.5 ${
                              dark ? "border-orange-400" : "border-orange-500"
                            }`}
                          >
                            <Check className="h-3 w-3 text-orange-500" strokeWidth={3} />
                          </div>
                          <span
                            className={`text-base font-serif ${
                              dark ? "text-slate-100" : "text-slate-800"
                            }`}
                          >
                            {f.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}