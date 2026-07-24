"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";
import { TrialExpiryPopup } from "./TrialExpiryPopup";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionData {
  accessType: string;
  plan: {
    id: number;
    title: string;
    price: string;
    billingCycle: string;
  };
  status: string;
  trialDaysRemaining: number;
  trialEndsAt: string;
  currentPeriodEnd: string;
  startsAt: string;
}

interface DashboardResponse {
  statusCode: number;
  data: SubscriptionData;
  message: string;
  success: boolean;
}

const fetchDashboardData = async (): Promise<DashboardResponse> => {
  const response = await fetch("/api/subscriber-dashbaord", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  const data = await response.json();
  return data;
};

const CountdownTimer = ({
  targetDate,
  label,
}: {
  targetDate: string;
  label: string;
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;
      console.log("targetDate:", targetDate);
      console.log("parsed target:", new Date(targetDate).toString());
      console.log("parsed target ISO:", new Date(targetDate).toISOString());
      console.log("now:", new Date().toString());
      console.log("difference:", target - now);

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return <div className="text-red-600 font-medium">{label} has expired</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="flex gap-3">
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
            <span className="text-2xl font-bold text-gray-800">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Days</div>
        </div>
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
            <span className="text-2xl font-bold text-gray-800">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Hours</div>
        </div>
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
            <span className="text-2xl font-bold text-gray-800">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Mins</div>
        </div>
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg px-3 py-2 min-w-[50px]">
            <span className="text-2xl font-bold text-gray-800">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Secs</div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    retry: 1,

    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const subscription = data?.success ? data.data : null;

  // v5 dropped onSuccess/onError from useQuery — handle the popup trigger here instead
  useEffect(() => {
    if (!subscription) return;

    const alreadyShownTrial = sessionStorage.getItem("trialPopupShown");
    const alreadyShownExpired = sessionStorage.getItem(
      "trialExpiredPopupShown",
    );

    if (subscription.status === "TRIALING" && !alreadyShownTrial) {
      setShowPopup(true);
      sessionStorage.setItem("trialPopupShown", "true");
    } else if (subscription.status === "EXPIRED" && !alreadyShownExpired) {
      setShowPopup(true);
      sessionStorage.setItem("trialExpiredPopupShown", "true");
    }
  }, [subscription]);

  const handlePopupDismiss = () => {
    setShowPopup(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <h3 className="font-semibold">Error loading dashboard</h3>
          </div>
          <p className="text-red-700 mt-2">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md w-full text-center">
          <h3 className="text-lg font-semibold text-yellow-800">
            No subscription found
          </h3>
          <p className="text-yellow-700 mt-2">
            Please subscribe to access premium content.
          </p>
          <button
            onClick={() => router.push("/admin/plans")}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "TRIALING":
        return <Clock className="w-6 h-6 text-blue-600" />;
      case "EXPIRED":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "TRIALING":
        return "bg-blue-100 text-blue-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(price));
  };

  const getTimerLabel = (status: string) => {
    switch (status) {
      case "TRIALING":
        return "Trial ends in";
      case "ACTIVE":
        return "Subscription renews in";
      default:
        return "Time remaining";
    }
  };

  const getTimerDate = (status: string) => {
    switch (status) {
      case "TRIALING":
        return subscription.trialEndsAt;
      case "ACTIVE":
        return subscription.currentPeriodEnd;
      default:
        return subscription.currentPeriodEnd;
    }
  };

  console.log("subscription", subscription);
  console.log("timer date", getTimerDate(subscription.status));

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's your subscription overview.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className={`px-6 py-4 border-b ${subscription.status === "EXPIRED" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(subscription.status)}
                  <div>
                    <div className="font-semibold text-gray-900">
                      {subscription.status === "ACTIVE" &&
                        "Active Subscription"}
                      {subscription.status === "TRIALING" && "Trial Period"}
                      {subscription.status === "EXPIRED" &&
                        "Subscription Expired"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Access Type: {subscription.accessType}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}
                >
                  {subscription.status}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Current Plan
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <span className="text-xl font-bold text-gray-900">
                        {subscription?.plan?.title}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {formatPrice(subscription?.plan?.price)} /{" "}
                      {subscription?.plan?.billingCycle?.toLowerCase()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Subscription Started
                    </div>
                    <div className="text-gray-900">
                      {formatDate(subscription?.startsAt)}
                    </div>
                  </div>

                  {(subscription?.status === "TRIALING" ||
                    subscription?.status === "ACTIVE") && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Timer
                          className={`w-4 h-4 ${subscription?.status === "TRIALING" ? "text-blue-500" : "text-green-500"}`}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {getTimerLabel(subscription?.status)}
                        </span>
                      </div>
                      <CountdownTimer
                        targetDate={getTimerDate(subscription?.status)}
                        label={getTimerLabel(subscription?.status)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Current Period Ends
                    </div>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(subscription?.currentPeriodEnd)}
                    </div>
                  </div>

                  {subscription?.status === "TRIALING" && (
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Trial Days Remaining
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-lg font-semibold text-blue-600">
                          {subscription?.trialDaysRemaining} days
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Trial ends: {formatDate(subscription?.trialEndsAt)}
                      </div>
                    </div>
                  )}

                  {subscription?.status === "EXPIRED" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-800">
                            Subscription Expired
                          </h4>
                          <p className="text-sm text-red-700">
                            Your subscription ended on{" "}
                            {formatDate(subscription?.currentPeriodEnd)}.
                            Subscribe now to regain access.
                          </p>
                          <button
                            onClick={() => router.push("/admin/plans")}
                            className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition text-sm"
                          >
                            Subscribe Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {subscription?.status === "ACTIVE" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Your subscription is active
                        </span>
                      </div>
                    </div>
                  )}

                  {subscription?.status === "TRIALING" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-800 font-medium">
                          You're on a trial period
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
                {subscription?.status !== "EXPIRED" && (
                  <button
                    onClick={() => router.push("/subscription/plans")}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition"
                  >
                    {subscription?.status === "TRIALING"
                      ? "Upgrade Now"
                      : "Manage Subscription"}
                  </button>
                )}
                <button
                  onClick={() => router.push("/admin/settings")}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-lg transition"
                >
                  Account Settings
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Plan</div>
              <div className="text-lg font-semibold text-gray-900">
                {subscription?.plan?.title}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Status</div>
              <div
                className={`text-lg font-semibold ${subscription?.status === "ACTIVE" ? "text-green-600" : subscription?.status === "TRIALING" ? "text-blue-600" : "text-red-600"}`}
              >
                {subscription?.status}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-500">Billing Cycle</div>
              <div className="text-lg font-semibold text-gray-900">
                {subscription?.plan?.billingCycle}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrialExpiryPopup
        show={showPopup}
        status={subscription?.status}
        trialDaysRemaining={subscription?.trialDaysRemaining}
        trialEndsAt={subscription?.trialEndsAt}
        onDismiss={handlePopupDismiss}
      />
    </>
  );
}
