import dynamic from "next/dynamic";
import { isModuleInstalled } from "@/src/lib/core/isModuleInstalled";

const SubscriptionDashboard = dynamic(
  () => import("@/src/components/subscription/dashboard"),
);

export default function DashboardPage() {
  return isModuleInstalled("subscription-billing") ? (
    <SubscriptionDashboard />
  ) : null;
}
