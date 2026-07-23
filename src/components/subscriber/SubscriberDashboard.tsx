"use client";

import { useState } from "react";
import SubscriptionNavbar from "../subscription/dashboard-navbar";
import { SubscriberSidebar } from "../subscription/sidebar";
import { Menu } from "lucide-react";
import { WelcomePopup } from "../subscription/welcome-popup";
import { TrialExpiryPopup } from "../subscription/TrialExpiryPopup";
import DashboardPage from "../subscription/dashboard";
import { useSubscription } from "@/src/hooks/use-subscription";

/**
 * ═════════════════════════════════════════════════════════════════════
 * SUBSCRIBER DASHBOARD
 * ═════════════════════════════════════════════════════════════════════
 *
 * Main dashboard container for /dashboard route.
 * Fetches subscription data once via useSubscription hook (cached).
 * Manages popups (welcome, expiry) based on subscription state.
 *
 * Note: Routes now determine what content is shown (via URL).
 * Previously used activeSection state, but that's no longer needed.
 */

export default function SubscriberDashboard() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ── Fetch subscription data once (cached by React Query) ──
  const { access, isLoading: accessLoading, refetch } = useSubscription();

  // ── Determine popup visibility based on subscription state ──
  const showWelcomePopup = !access;
  const showExpiryPopup = Boolean(access && access.status === "EXPIRED");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubscriptionNavbar />

      <div className="flex flex-1 overflow-hidden">
        <SubscriberSidebar
          access={access}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="text-gray-700"
            >
              <Menu size={24} />
            </button>
          </div>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <DashboardPage />
            </div>
          </main>
        </div>
      </div>

      <WelcomePopup
        show={showWelcomePopup}
        onTrialStarted={() => {
          // Refetch subscription data after trial starts
          refetch();
        }}
      />

      <TrialExpiryPopup
        show={showExpiryPopup}
        onDismiss={() => {
          // Could refetch or just dismiss
        }}
      />
    </div>
  );
}
