// src/app/(public)/layout.tsx
"use client";
import SiteLayout from "@/src/components/site/SiteLayout";

export default function PublicRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}