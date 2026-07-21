"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchers } from "@/src/lib/fetchers";
import { queryKeys } from "@/src/lib/query-key";
import { useCurrentUser } from "@/src/hooks/use-current-user";

function hexToRgba(hex: string, alpha: number) {
  const clean = hex?.replace("#", "") || "0B0F1A";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// scope any raw CSS rules under #site-navbar so it can't leak/break the rest of the page
function scopeCss(raw: string, scopeSelector = "#site-navbar") {
  if (!raw) return "";
  return raw.replace(/([^{}]+)\{/g, (_match, selector) => {
    const scoped = selector
      .split(",")
      .map((s: string) => `${scopeSelector} ${s.trim()}`)
      .join(", ");
    return `${scoped} {`;
  });
}

export default function SiteNavbar({ settings, headerMenu, config }: any) {
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState<Set<string>>(
    new Set(),
  );
  const { user, isLoading: userLoading } = useCurrentUser();

  const dashboardUrl =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? "/admin"
      : "/dashboard";

  // ── merged config with defaults ──
  const cfg = {
    bgColor: config?.bgColor ?? "#0B0F1A",
    bgOpacity: (config?.bgOpacity ?? 90) / 100,
    sticky: config?.sticky ?? true,
    blur: config?.blur ?? true,
    linkColor: config?.linkColor ?? "#cbd5e1",
    linkHoverColor: config?.linkHoverColor ?? "#ffffff",
    accentColor: config?.accentColor ?? "#22d3ee",
    dropdownBg: config?.dropdownBg ?? "#111827",
    showLogin: config?.showLogin ?? true,
    showSignup: config?.showSignup ?? true,
    showPricing: config?.showPricing ?? true,
    loginLabel: config?.loginLabel ?? "Log In",
    signupLabel: config?.signupLabel ?? "Sign Up",
    pricingLabel: config?.pricingLabel ?? "Pricing",
    customCss: config?.customCss ?? "",
  };

  // ── inject scoped custom CSS ──
  useEffect(() => {
    if (!cfg.customCss) return;
    const style = document.createElement("style");
    style.id = "navbar-custom-css";
    style.textContent = scopeCss(cfg.customCss);
    document.head.appendChild(style);
    return () => {
      document.getElementById("navbar-custom-css")?.remove();
    };
  }, [cfg.customCss]);

  const toggleMobileSubmenu = (itemId: string) => {
    setOpenMobileSubmenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const prefetchPage = (href: string, type: string, slug: string) => {
    if (type === "page" && slug) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.page(slug),
        queryFn: () => fetchers.publicPageBySlug(slug),
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  const buildTree = (items: any[]) => {
    const map = new Map();
    items.forEach((item) => map.set(item.id, { ...item, children: [] }));
    const roots: any[] = [];
    items.forEach((item) => {
      if (item.parentId)
        map.get(item.parentId)?.children.push(map.get(item.id));
      else roots.push(map.get(item.id));
    });
    return roots;
  };

  const getMenuItems = (menu: any): any[] =>
    menu?.menuitem ?? menu?.menuitems ?? menu?.items ?? [];

  const renderItems = (
    items: any[],
    isMobile = false,
    level = 0,
  ): React.ReactNode =>
    items.map((item) => {
      const href =
        item.type === "page" && item.slug ? `/${item.slug}` : item.url || "#";
      const hasChildren = item.children?.length > 0;
      const isOpen = openMobileSubmenus.has(item.id);

      if (isMobile) {
        return (
          <li
            key={item.id}
            className="w-full border-b border-white/5 last:border-0"
          >
            <div className="flex items-center justify-between">
              <Link
                href={href}
                className={`flex-1 text-sm font-medium py-3 px-4 hover:bg-white/5 transition-colors ${
                  level > 0 ? "pl-8" : ""
                }`}
                style={{ color: cfg.linkColor }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
              {hasChildren && (
                <button
                  onClick={() => toggleMobileSubmenu(item.id)}
                  className="px-4 py-3 text-slate-400 hover:text-cyan-300 transition-transform duration-200"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
            {hasChildren && isOpen && (
              <ul className="bg-white/[0.03]">
                {renderItems(item.children, isMobile, level + 1)}
              </ul>
            )}
          </li>
        );
      }

      return (
        <li key={item.id} className="relative group">
          <Link
            href={href}
            className="block text-sm font-medium px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
            style={{ color: cfg.linkColor }}
            onMouseEnter={(e) => {
              prefetchPage(href, item.type, item.slug);
              (e.currentTarget as HTMLElement).style.color = cfg.linkHoverColor;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = cfg.linkColor;
            }}
          >
            {item.label}
            {hasChildren && <span className="ml-1 opacity-60">▾</span>}
          </Link>
          {hasChildren && (
            <ul
              className="absolute top-full left-0 w-48 border border-white/10 rounded-xl shadow-2xl shadow-black/40 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
              style={{ backgroundColor: cfg.dropdownBg }}
            >
              {renderItems(item.children, false)}
            </ul>
          )}
        </li>
      );
    });

  const menuItems = headerMenu ? buildTree(getMenuItems(headerMenu)) : [];

  return (
    <header
      id="site-navbar"
      className={`${cfg.sticky ? "sticky top-0" : ""} z-50 ${cfg.blur ? "backdrop-blur" : ""} border-b border-white/5`}
      style={{ backgroundColor: hexToRgba(cfg.bgColor, cfg.bgOpacity) }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings?.logo ? (
            <img src={settings.logo} alt={settings.siteName} className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-bold tracking-tight text-white">{settings?.siteName}</span>
          )}
        </Link>

        <nav className="hidden lg:flex items-center">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {renderItems(menuItems)}
          </ul>
        </nav>

        {!user ? (
          <div className="hidden lg:flex items-center gap-3">
            {cfg.showLogin && (
              <Link
                href="/login"
                className="rounded-md border border-white/10 px-5 py-2 text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition-colors"
                style={{ color: cfg.linkColor }}
              >
                {cfg.loginLabel}
              </Link>
            )}
            {cfg.showSignup && (
              <Link
                href="/register"
                className="rounded-md px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors"
                style={{ backgroundColor: cfg.accentColor }}
              >
                {cfg.signupLabel}
              </Link>
            )}
            {cfg.showPricing && (
              <Link
                href="/pricing"
                className="rounded-md border border-white/10 px-5 py-2 text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition-colors"
                style={{ color: cfg.linkColor }}
              >
                {cfg.pricingLabel}
              </Link>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href={dashboardUrl}
              className="rounded-md px-5 py-2 text-sm font-semibold text-slate-900 transition-colors"
              style={{ backgroundColor: cfg.accentColor }}
            >
              Dashboard
            </Link>
            {cfg.showPricing && (
              <Link
                href="/pricing"
                className="rounded-md border border-white/10 px-5 py-2 text-sm font-semibold hover:bg-white/5 hover:border-white/20 transition-colors"
                style={{ color: cfg.linkColor }}
              >
                {cfg.pricingLabel}
              </Link>
            )}
          </div>
        )}

        {/* Mobile Right Section unchanged from your original */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="relative group/tooltip">
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 transition-colors"
              aria-label="Sign in"
            >
              <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
            <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50">
              <div className="bg-[#111827] border border-white/10 text-white text-xs font-medium py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg">
                Log In
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-[#111827]"></div>
              </div>
            </div>
          </div>

          <div className="relative group/tooltip">
            <Link
              href="/register"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
              style={{ backgroundColor: cfg.accentColor }}
              aria-label="Sign up"
            >
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>
            <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none z-50">
              <div className="bg-[#111827] border border-white/10 text-white text-xs font-medium py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg">
                Sign Up
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-[#111827]"></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        className={`fixed top-[57px] h-[calc(100vh-57px)] left-0 right-0 border-t border-white/5 shadow-2xl z-50 transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: hexToRgba(cfg.bgColor, 1) }}
      >
        <div className="h-full overflow-y-auto">
          <nav className="flex flex-col">
            <ul className="flex flex-col list-none m-0 p-0">
              {renderItems(menuItems, true)}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}