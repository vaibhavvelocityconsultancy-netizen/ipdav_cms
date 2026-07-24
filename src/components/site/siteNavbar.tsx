"use client";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchers } from "@/src/lib/fetchers";
import { queryKeys } from "@/src/lib/query-key";
import { useCurrentUser } from "@/src/hooks/use-current-user";

export default function SiteNavbar({ settings, headerMenu }: any) {
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState<Set<string>>(
    new Set(),
  );
  const [searchValue, setSearchValue] = useState("");
  const { user } = useCurrentUser();

  const dashboardUrl =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? "/admin"
      : "/dashboard";

  const toggleMobileSubmenu = (itemId: string) => {
    setOpenMobileSubmenus((prev) => {
      const newSet = new Set(prev);
      newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
      return newSet;
    });
  };

  const prefetchPage = (type: string, slug: string) => {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchValue)}`;
    }
  };

  const renderMenuBarItems = (items: any[]): React.ReactNode =>
    items.map((item) => {
      const href =
        item.type === "page" && item.slug ? `/${item.slug}` : item.url || "#";
      const hasChildren = item.children?.length > 0;
      return (
        <li key={item.id} className="relative group">
          <Link
            href={href}
            className="block text-[15px] font-medium text-white px-6 py-4 transition-colors hover:opacity-80"
            onMouseEnter={() => prefetchPage(item.type, item.slug)}
          >
            {item.label}
            {hasChildren && <span className="ml-1 opacity-70">▾</span>}
          </Link>
          {hasChildren && (
            <ul className="absolute top-full left-0 w-52 bg-[#111827] border border-white/10 rounded-b-md shadow-2xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {item.children.map((child: any) => (
                <li key={child.id}>
                  <Link
                    href={
                      child.type === "page" && child.slug
                        ? `/${child.slug}`
                        : child.url || "#"
                    }
                    className="block text-sm px-4 py-2 text-slate-200 hover:bg-white/5"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    });

  const renderMobileItems = (items: any[], level = 0): React.ReactNode =>
    items.map((item) => {
      const href =
        item.type === "page" && item.slug ? `/${item.slug}` : item.url || "#";
      const hasChildren = item.children?.length > 0;
      const isOpen = openMobileSubmenus.has(item.id);
      return (
        <li
          key={item.id}
          className="w-full border-b border-black/5 last:border-0"
        >
          <div className="flex items-center justify-between">
            <Link
              href={href}
              className={`flex-1 text-sm font-medium py-3 px-4 text-slate-800 ${level > 0 ? "pl-8" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
            {hasChildren && (
              <button
                onClick={() => toggleMobileSubmenu(item.id)}
                className="px-4 py-3 text-slate-500"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
          {hasChildren && isOpen && (
            <ul className="bg-black/[0.02]">
              {renderMobileItems(item.children, level + 1)}
            </ul>
          )}
        </li>
      );
    });

  const menuItems = headerMenu ? buildTree(getMenuItems(headerMenu)) : [];
    // Only add Pricing if there are already other nav items
const finalMenuItems =
  menuItems.length > 0
    ? [
        ...menuItems,
        {
          id: "pricing-static",
          label: "Pricing",
          type: "custom",
          url: "/pricing",
          children: [],
        },
      ]
    : menuItems;
  return (
    <header id="site-navbar" className="m-0 p-0">
      {/* ROW 1 — white bar: logo / search / login-register */}
      <div className="bg-white border-b border-black/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-9 w-auto"
              />
            ) : (
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {settings?.siteName}
              </span>
            )}
          </Link>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl"
          >
            <div className="flex w-full rounded-md border border-slate-300 overflow-hidden">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for anything..."
                className="flex-1 px-4 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>

          {!user ? (
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                Login
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href="/register"
                className="text-sm font-medium text-orange-500 hover:text-orange-600"
              >
                Register
              </Link>
            </div>
          ) : (
            <Link
              href={dashboardUrl}
              className="hidden lg:block rounded-md px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shrink-0"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden inline-flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-black/10"
            aria-label="Toggle menu"
          >
            <span className="block h-0.5 w-5 bg-slate-800" />
            <span className="block h-0.5 w-5 bg-slate-800" />
            <span className="block h-0.5 w-5 bg-slate-800" />
          </button>
        </div>
      </div>

      {/* ROW 2 — orange full-width menu bar (desktop only) */}
      <nav className="hidden lg:block w-full">
        <div className="max-w-7xl mx-auto bg-orange-500">
          <ul className="flex items-center gap-2 list-none m-0 p-0 px-6">
            {renderMenuBarItems(finalMenuItems)}
          </ul>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div
        className={`fixed top-0 h-full left-0 right-0 z-50 bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="p-4 border-b border-black/5"
          >
            <div className="flex w-full rounded-md border border-slate-300 overflow-hidden">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for anything..."
                className="flex-1 px-4 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="px-4 text-sm font-semibold text-white bg-blue-600"
              >
                Go
              </button>
            </div>
          </form>
          <nav className="flex flex-col">
            <ul className="flex flex-col list-none m-0 p-0">
              {renderMobileItems(finalMenuItems)}
            </ul>
          </nav>
          <div className="flex items-center gap-4 p-4 border-t border-black/5">
            <Link href="/login" className="text-sm font-medium text-orange-500">
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-orange-500"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
