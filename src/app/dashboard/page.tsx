"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubscriberDashboard from "@/src/components/subscriber/SubscriberDashboard";
import { useCurrentUser } from "@/src/hooks/use-current-user";
// import { SubscriberDashboard } from "@/src/components/subscriber/SubscriberDashboard";
// import SubscriberDashboard from "@/src/components/subscriber/SubscriberDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isFetching } = useCurrentUser();
  const isAuthCheckPending = isLoading || isFetching;

  useEffect(() => {
    if (isAuthCheckPending) return;

    if (!user) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      router.replace("/admin");
      return;
    }

    if (user.role !== "SUBSCRIBER") {
      router.replace("/login");
    }
  }, [user, isAuthCheckPending, router]);

  if (isAuthCheckPending || !user) return null;

  return <SubscriberDashboard />;
}
