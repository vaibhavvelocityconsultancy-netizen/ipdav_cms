import dynamic from "next/dynamic";
import { isModuleInstalled } from "@/src/lib/core/isModuleInstalled";

const SubscriptionLayout = dynamic(() => import("../subscription/layout"));

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return isModuleInstalled("subscription-billing") ? (
    <SubscriptionLayout>{children}</SubscriptionLayout>
  ) : (
    children
  );
}
