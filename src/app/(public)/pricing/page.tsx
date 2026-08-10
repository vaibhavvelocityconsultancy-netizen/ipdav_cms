"use client";

import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetchers } from "../../../lib/fetchers";
import { useCurrentUser } from "@/src/hooks/use-current-user";
import { FormEmbed } from "@/src/components/public/FormEmbed";

interface Plan {
  id: number;
  title: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  allowMonthly: boolean;
  allowYearly: boolean;
  isFeatured: boolean;
  features: Feature[];
}

interface Feature {
  id: number;
  title: string;
}

function formatUSD(val: number | null) {
  if (!val) return "Free";
  return "$" + val.toLocaleString("en-US");
}

export default function PricingPlansPage() {
  const router = useRouter();

  const { data, isLoading } = useSWR("plans", fetchers.publicPlans);

  const { data: pricingSettings } = useSWR(
    "pricing-page-settings",
    async () => {
      const res = await fetch("/api/pricing-page-settings");

      if (!res.ok) {
        throw new Error("Failed to fetch pricing page settings");
      }

      return res.json();
    },
  );

  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const allPlans = (data?.data ?? []) as Plan[];
  const pricingForm = pricingSettings?.data?.form;

  // Check if any plans have monthly/yearly enabled
  const hasMonthly = useMemo(
    () => allPlans.some((p: Plan) => p.allowMonthly && p.monthlyPrice != null),
    [allPlans],
  );
  const hasYearly = useMemo(
    () => allPlans.some((p: Plan) => p.allowYearly && p.yearlyPrice != null),
    [allPlans],
  );

  // Toggle only makes sense if BOTH monthly and yearly exist
  const showToggle = hasMonthly && hasYearly;

  const [selectedCycle, setSelectedCycle] = useState<"MONTHLY" | "YEARLY">(
    "MONTHLY",
  );

  // Filter: if toggle is shown, filter by selected cycle.
  const plans = useMemo(() => {
    if (!showToggle) return allPlans;
    return allPlans.filter((p: Plan) => {
      if (selectedCycle === "MONTHLY") {
        return p.allowMonthly && p.monthlyPrice != null;
      } else {
        return p.allowYearly && p.yearlyPrice != null;
      }
    });
  }, [allPlans, showToggle, selectedCycle]);

  function handleSelectPlan(
    planId: number,
    billingCycle: "MONTHLY" | "YEARLY",
  ) {
    if (userLoading) return;
    const checkoutUrl = `/checkout?plan=${planId}&billingCycle=${billingCycle}`;
    if (!currentUser) {
      router.push(`/register?redirect=${encodeURIComponent(checkoutUrl)}`);
      return;
    }
    router.push(checkoutUrl);
  }

  function getPlanPrice(
    plan: Plan,
    cycle: "MONTHLY" | "YEARLY",
  ): number | null {
    if (cycle === "MONTHLY") {
      return plan.allowMonthly ? plan.monthlyPrice : null;
    } else {
      return plan.allowYearly ? plan.yearlyPrice : null;
    }
  }

  function getPlanLabel(plan: Plan, cycle: "MONTHLY" | "YEARLY"): string {
    if (cycle === "MONTHLY") {
      return plan.allowMonthly ? "Monthly" : "";
    } else {
      return plan.allowYearly ? "Yearly" : "";
    }
  }

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !allPlans.length ? (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600 text-lg">No plans available</p>
        </div>
      ) : (
        <>
          <section className="w-full bg-[#0B0F1A] py-20">
            <div className="mx-auto max-w-7xl px-6 text-center">
              <h1 className="text-5xl font-bold text-white lg:text-7xl">
                Pricing
              </h1>
              <div className="mt-6 flex justify-center">
                <nav className="breadcrumb" aria-label="breadcrumb">
                  <ol className="breadcrumb-list flex items-center flex-wrap text-sm">
                    <li className="flex items-center">
                      <a
                        href="/"
                        className="breadcrumb-link text-slate-400 hover:text-white transition-colors"
                      >
                        Home
                      </a>
                      <span className="mx-2 text-slate-500">/</span>
                    </li>
                    <li className="flex items-center">
                      <span
                        className="font-medium text-slate-300"
                        aria-current="page"
                      >
                        Pricing
                      </span>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </section>

          <div className="min-h-screen bg-[#f8f9fa]">
            <div className="relative px-4 py-16 max-w-6xl mx-auto">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan: Plan) => {
                  const dark = plan.isFeatured;
                  const currentCycle = showToggle ? selectedCycle : "MONTHLY";
                  const price = getPlanPrice(plan, currentCycle);
                  const label = getPlanLabel(plan, currentCycle);

                  // If plan doesn't support the current cycle, skip it
                  if (!price && !label) return null;

                  return (
                    <div
                      key={plan.id}
                      className={`relative w-full rounded-none overflow-hidden flex flex-col border  ${
                        dark
                          ? "bg-slate-900  border-t-4 border-white text-white"
                          : "bg-slate-50 border-t-4 border-slate-900 text-slate-900"
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
                            {formatUSD(price)}
                          </span>
                          <span
                            className={`text-lg ${
                              dark ? "text-slate-300" : "text-slate-600"
                            }`}
                          >
                            / {label}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            handleSelectPlan(plan.id, currentCycle)
                          }
                          disabled={userLoading}
                          className={`w-full py-3 text-sm font-medium mb-6 disabled:opacity-60 ${
                            dark
                              ? "bg-white text-slate-900 hover:bg-slate-100"
                              : "bg-[#152539] text-white hover:bg-slate-800"
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
                            {plan.features.map((f: Feature) => (
                              <div
                                key={f.id}
                                className="flex items-start gap-3"
                              >
                                <div
                                  className={`flex-shrink-0 h-4 w-4 border flex items-center justify-center mt-0.5 ${
                                    dark
                                      ? "border-orange-400"
                                      : "border-orange-500"
                                  }`}
                                >
                                  <Check
                                    className="h-3 w-3 text-orange-500"
                                    strokeWidth={3}
                                  />
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

              {pricingForm && (
                <div className="mt-24">
                  <FormEmbed slug={pricingForm.slug} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}