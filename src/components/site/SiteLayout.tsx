"use client";

import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/src/hooks/use-current-user";
import { buildAdminToolbarHtml } from "@/src/lib/admin-toolbar";
import { fetchers } from "@/src/lib/fetchers";
import SiteNavbar from "./siteNavbar";
import SiteFooter from "./SiteFooter";

import AnalyticsScripts from "./AnalyticsScripts";

const DEFAULT_FOOTER_SETTINGS = {
  footerLogo: "",
  footerBrandTitle: "",
  footerDescription: "",
  footerAddress: "",
  footerEmail: "",
  footerCopyright: "",
  socialLinks: [] as any[],
};

const DEFAULT_BREADCRUMB_SETTINGS = {
  enabled: true,
  homeLabel: "Home",
  separator: "/",
  showHome: true,
  showParent: true,
  showCurrent: true,
  schemaEnabled: false,
  cssClass: "",
  linkColor: "#4b5563",
  linkHoverColor: "#111827",
  currentColor: "#6b7280",
  separatorColor: "#9ca3af",
  customCss: "",
};

interface SiteLayoutProps {
  children: React.ReactNode;
  pageId?: string | number | null;
  editUrl?: string;
}

export default function SiteLayout({
  children,
  pageId,
  editUrl,
}: SiteLayoutProps) {
  const { user } = useCurrentUser();

  const { data: bootstrapData, isLoading: bootstrapLoading } = useQuery<{
    data: {
      settings: any;
      homepage: any;
      menus: any[];
      footerMenus: any[];
      footerSettings: any;
      footerConfig?: any;
      navbarConfig?: any;
      assets: { css?: string; js?: string };
      breadcrumbSettings?: any;
      analyticsSettings?: any;
    };
  }>({
    queryKey: ["public", "bootstrap"],
    queryFn: fetchers.publicBootstrap,
    staleTime: 60_000,
  });

  const settings = useMemo(
    () => bootstrapData?.data?.settings,
    [bootstrapData],
  );

  const menus = useMemo(
    () => bootstrapData?.data?.menus ?? [],
    [bootstrapData],
  );

  const footerMenus = useMemo(
    () => bootstrapData?.data?.footerMenus ?? [],
    [bootstrapData],
  );

  const footerSettings = useMemo(
    () => bootstrapData?.data?.footerSettings ?? {},
    [bootstrapData],
  );

  const globalCss = useMemo(
    () => bootstrapData?.data?.assets?.css ?? "",
    [bootstrapData],
  );

  const globalJs = useMemo(
    () => bootstrapData?.data?.assets?.js ?? "",
    [bootstrapData],
  );

  const highlightAutoLinks = settings?.highlightAutoLinks ?? false;

  const footerConfig = bootstrapData?.data?.footerConfig;
  const navbarConfig = bootstrapData?.data?.navbarConfig;

  const breadcrumbSettings = {
    ...DEFAULT_BREADCRUMB_SETTINGS,
    ...bootstrapData?.data?.breadcrumbSettings,
  };

  const headerMenu = useMemo(
    () => menus.find((menu) => menu.location === "header"),
    [menus],
  );

  const footer = useMemo(
    () => ({
      ...DEFAULT_FOOTER_SETTINGS,
      ...footerSettings,
      footerBrandTitle:
        footerSettings.footerBrandTitle || settings?.siteName || "My Website",
      footerCopyright:
        footerSettings.footerCopyright ||
        `© ${new Date().getFullYear()} ${settings?.siteName}. All rights reserved.`,
    }),
    [footerSettings, settings],
  );

  const isAdmin = user?.role === "ADMIN";

  const showToolbar = settings?.showAdminToolbar && isAdmin;

  useEffect(() => {
    if (!settings) return;
    document.title = settings.siteName || "";
  }, [settings]);

  useEffect(() => {
    const style = document.getElementById(
      "global-cms-css",
    ) as HTMLStyleElement | null;

    if (!globalCss) {
      style?.remove();
      return;
    }

    if (style) {
      style.textContent = globalCss;
      return;
    }

    const nextStyle = document.createElement("style");
    nextStyle.id = "global-cms-css";
    nextStyle.textContent = globalCss;
    document.head.appendChild(nextStyle);
  }, [globalCss]);

  useEffect(() => {
    const existing = document.getElementById("global-cms-js");

    if (!globalJs) {
      existing?.remove();
      return;
    }

    if (existing) {
      if (existing.textContent !== globalJs) {
        const script = document.createElement("script");
        script.id = "global-cms-js";
        script.textContent = globalJs;
        existing.replaceWith(script);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "global-cms-js";
    script.textContent = globalJs;
    document.body.appendChild(script);
  }, [globalJs]);

  useEffect(() => {
    const styleId = "auto-link-highlight-css";
    const existing = document.getElementById(
      styleId,
    ) as HTMLStyleElement | null;

    if (!highlightAutoLinks) {
      existing?.remove();
      return;
    }

    if (existing) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent =
      ".auto-internal-link { border-bottom: 1px dotted currentColor; }";
    document.head.appendChild(style);

    return () => style.remove();
  }, [highlightAutoLinks]);

  const hasBootstrap = !!bootstrapData?.data;
  const isInitialLoad = !hasBootstrap;

  if (isInitialLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Loading your site...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AnalyticsScripts analytics={bootstrapData?.data?.analyticsSettings} />

      {breadcrumbSettings?.customCss && (
        <style
          id="breadcrumb-custom-css"
          dangerouslySetInnerHTML={{ __html: breadcrumbSettings.customCss }}
        />
      )}

      {showToolbar && (
        <div
          dangerouslySetInnerHTML={{
            __html: buildAdminToolbarHtml({
              pageId,
              siteName: settings?.siteName,
              editUrl,
            }),
          }}
        />
      )}
      <SiteNavbar
        settings={settings}
        headerMenu={headerMenu}
        config={navbarConfig}
      />

      {children}
      <SiteFooter
        footer={footer}
        footerMenus={footerMenus}
        config={footerConfig}
      />
    </div>
  );
}
