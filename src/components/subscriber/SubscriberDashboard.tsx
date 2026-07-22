"use client";

import { useEffect, useState } from "react";
import SubscriptionNavbar from "../subscription/dashboard-navbar";
import { SubscriberSidebar } from "../subscription/sidebar";
import { Menu } from "lucide-react";
// import { Dashboard } from "../subscription/dashboard";
import { CoursesPage } from "../subscription/courses";
import { BillingPage } from "../subscription/billing-details";
// import { TrialExpiryPopup } from "../subscription/trial-expiry-popup";
import { WelcomePopup } from "../subscription/welcome-popup";
import { TrialExpiryPopup } from "../subscription/TrialExpiryPopup";
import DashboardPage from "../subscription/dashboard";

interface AccessData {
  id: number;
  userId: number;
  planId: number;
  billingCycle: string;
  status: string;
  startsAt: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  plan: {
    id: number;
    tenantId: number;
    title: string;
    slug: string;
  };
}

export default function SubscriberDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [access, setAccess] = useState<AccessData | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [showExpiryPopup, setShowExpiryPopup] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  function fetchAccess() {
    return fetch("/api/subscription", {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Subscription fetch failed: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => {
        const data: AccessData | null = res?.data ?? null;
        setAccess(data);
        setShowWelcomePopup(!data);
        setShowExpiryPopup(Boolean(data && data.status === "EXPIRED"));
      })
      .catch((error) => {
        console.error("fetchAccess error", error);
        setAccess(null);
        setShowWelcomePopup(true);
      });
  }

  useEffect(() => {
    fetchAccess().finally(() => setAccessLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubscriptionNavbar />

      <div className="flex flex-1 overflow-hidden">
        <SubscriberSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Platform</h1>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-gray-700"
            >
              <Menu size={24} />
            </button>
          </div>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {activeSection === "dashboard" && (
                <DashboardPage access={access} loading={accessLoading} />
              )}
              {activeSection === "courses" && <CoursesPage />}
              {activeSection === "billing" && <BillingPage />}
            </div>
          </main>
        </div>
      </div>

      <WelcomePopup
        show={showWelcomePopup}
        onTrialStarted={() => {
          setShowWelcomePopup(false);
          fetchAccess(); // refresh so Dashboard shows the new trial immediately
        }}
      />

      <TrialExpiryPopup
        access={access}
        loading={accessLoading}
        show={showExpiryPopup}
        onDismiss={() => setShowExpiryPopup(false)}
      />
    </div>
  );
}
