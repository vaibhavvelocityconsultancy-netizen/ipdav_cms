"use client";

import { useMemo, useState } from "react";
import { SubscriberSidebar } from "@/src/components/subscription/sidebar";
import { fetchers } from "@/src/lib/fetchers";
import { queryKeys } from "@/src/lib/query-key";
import { useQueries } from "@tanstack/react-query";
import SiteNavbar from "@/src/components/subscription/dashboard-navbar";
import { useSubscription } from "@/src/hooks/use-subscription";

/**
 * ═════════════════════════════════════════════════════════════════════
 * SUBSCRIPTION LAYOUT
 * ═════════════════════════════════════════════════════════════════════
 *
 * Single parent layout for all /subscription/* routes.
 * Fetches subscription data once and passes it to sidebar and children.
 * This ensures a single source of truth for access/subscription state.
 */

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ── Fetch subscription data once (cached by React Query) ──
  const { access, isLoading: subscriptionLoading } = useSubscription();

  const [
    { data: bootstrapData, isLoading: bootstrapLoading },
    { data: cssData, isLoading: cssLoading },
    { data: postsData, isLoading: postsLoading },
  ] = useQueries({
    queries: [
      {
        queryKey: ["public", "bootstrap"],
        queryFn: fetchers.publicBootstrap,
        staleTime: 60_000,
      },
      {
        queryKey: queryKeys.globalCss,
        queryFn: fetchers.globalCss,
        staleTime: Infinity,
      },
      {
        queryKey: queryKeys.posts,
        queryFn: fetchers.publicPosts,
        staleTime: 60_000,
      },
    ],
  });

  // ── Derived content ──
  const settings = useMemo(
    () => bootstrapData?.data?.settings,
    [bootstrapData],
  );

  const allMenus = useMemo(
    () => bootstrapData?.data?.menus ?? [],
    [bootstrapData],
  );

  const headerMenu = useMemo(
    () => allMenus.find((m: any) => m.location === "header"),
    [allMenus],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar
        settings={settings}
        onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <SubscriberSidebar
          access={access}

          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isSidebarCollapsed ? "lg:pl-20" : "lg:pl-60"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
