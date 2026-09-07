"use client";

import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/src/hooks/use-current-user";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/query-key";
import { fetchers } from "@/src/lib/fetchers";
import {
  DEFAULT_BREADCRUMB_SETTINGS,
  injectBreadcrumb,
  renderBreadcrumbHtml,
} from "@/src/lib/shortcode/renderBreadcrumbHtml";
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string | null;
  publishedAt?: string | null;
  categories?: { id: string; name: string; slug: string }[];
  tags?: { id: string; name: string; slug: string }[];
  seoData?: any;
}

const DEFAULT_FOOTER_SETTINGS = {
  footerLogo: "",
  footerBrandTitle: "",
  footerDescription: "",
  footerAddress: "",
  footerEmail: "",
  footerCopyright: "",
  socialLinks: [],
};

export default function PublicPostPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useCurrentUser();
  const slug = params.slug;

  // ── state ──
  // ── queries ──
  const [
    { data: settingsData, isLoading: settingsLoading },
    { data: cssData },
    { data: footerData },
    { data: menusData, isLoading: menusLoading },
    { data: postData, isLoading: postLoading },
  ] = useQueries({
    queries: [
      {
        queryKey: queryKeys.settings,
        queryFn: fetchers.publicSettings,
        staleTime: Infinity,
      },
      {
        queryKey: queryKeys.globalCss,
        queryFn: fetchers.globalCss,
        staleTime: Infinity,
      },
      {
        queryKey: queryKeys.footerSettings,
        queryFn: fetchers.publicFooterSettings,
        staleTime: Infinity,
      },
      {
        queryKey: queryKeys.menus,
        queryFn: fetchers.publicMenus,
        staleTime: Infinity,
      },
      {
        queryKey: queryKeys.post(slug),
        queryFn: () => fetchers.post(slug),
        enabled: !!slug,
        staleTime: 0,
      },
    ],
  });

  const { data: bootstrapData } = useQuery({
    queryKey: ["public", "bootstrap"],
    queryFn: fetchers.publicBootstrap,
    staleTime: 60_000,
  });

  // ── derived ──
  const settings = useMemo(() => settingsData?.data, [settingsData]);
  const globalCss = useMemo(() => cssData?.data?.css || "", [cssData]);
  const footerSettings = useMemo(() => footerData?.data ?? {}, [footerData]);
  const allMenus = useMemo(() => menusData?.data ?? [], [menusData]);
  const footerMenus = useMemo(
    () => allMenus.filter((m: any) => m.location === "footer"),
    [allMenus],
  );
  const post = useMemo(() => postData?.data ?? null, [postData]);
  const breadcrumbSettings = useMemo(
    () => bootstrapData?.data?.breadcrumbSettings,
    [bootstrapData],
  );

  const { data: postsListPageData } = useQuery({
    queryKey: queryKeys.pageById(settingsData?.data?.postsPageId ?? ""),
    queryFn: () => fetchers.pageById(settingsData?.data?.postsPageId),
    enabled: !!settingsData?.data?.postsPageId,
    staleTime: 60_000,
  });

  const postsListPage = useMemo(
    () => postsListPageData?.data ?? null,
    [postsListPageData],
  );

  const headerMenu = useMemo(
    () => allMenus.find((m: any) => m.location === "header"),
    [allMenus],
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

  // ── inject global CSS ──
  useEffect(() => {
    if (!globalCss) return;
    const style = document.createElement("style");
    style.id = "global-cms-css";
    style.textContent = globalCss;
    document.head.appendChild(style);
    return () => style.remove();
  }, [globalCss]);

  // ── loading ──
  // breadcrumb rendered as its own block — kept OUT of prose content
  const postBreadcrumbHtml = useMemo(() => {
    if (
      !breadcrumbSettings?.enabled ||
      !postsListPage?.html?.includes("[breadcrumb]")
    )
      return "";
    return renderBreadcrumbHtml(
      [
        { label: "Posts", href: "newweb/posts" },
        {
          label: post?.title || "Post",
          href: `newweb/posts/${post?.slug ?? ""}`,
        },
      ],
      breadcrumbSettings ?? DEFAULT_BREADCRUMB_SETTINGS,
    );
  }, [postsListPage?.html, post?.title, post?.slug, breadcrumbSettings]);
  // post body content — supports [breadcrumb] shortcode if an author types it inline,
  // but won't auto-inject (since we already render it separately above)
  const processedPostContent = useMemo(() => {
    if (!post?.content) return "";
    if (!post.content.includes("[breadcrumb]")) return post.content;

    return injectBreadcrumb(
      post.content,
      [
        { label: settings?.homeLabel || "Home", href: "newweb" },
        { label: "Posts", href: "newweb/posts" },
        { label: post.title, href: `newweb/posts/${post.slug}` },
      ],
      breadcrumbSettings,
      { isHome: false, is404: false, isSearch: false },
    );
  }, [post?.content, post?.title, post?.slug, settings, breadcrumbSettings]);
  const isLoading =
    (!settings || !post) && (settingsLoading || menusLoading || postLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-600">
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="mt-3 text-lg text-gray-600">
            Post not found: /posts/{slug}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen flex flex-col">
      <>
        <main className="flex-1 w-full max-w-[740px] mx-auto px-4 py-12 pb-16">
          {postBreadcrumbHtml && (
            <div dangerouslySetInnerHTML={{ __html: postBreadcrumbHtml }} />
          )}

          {/* categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((c: any) => (
                <a
                  key={c.id}
                  href={`/posts?category=${c.slug}`}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    router.push(`/posts?category=${c.slug}`);
                  }}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide hover:bg-gray-200"
                >
                  {c.name}
                </a>
              ))}
            </div>
          )}

          {/* title */}
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            {post.title}
          </h1>

          {/* meta */}
          {publishedDate && (
            <div className="text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
              {publishedDate}
            </div>
          )}
          {/* breadcrumb — own block, outside prose so it isn't styled by the typography plugin */}

          {/* featured image */}
          {post.featuredImage && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto max-h-[480px] object-cover"
              />
            </div>
          )}

          {/* content — page builder HTML */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: processedPostContent }}
          />

          {/* tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-200">
              {post.tags.map((t: any) => (
                <a
                  key={t.id}
                  href={`/posts?tag=${t.slug}`}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    router.push(`/posts?tag=${t.slug}`);
                  }}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full hover:bg-gray-200 hover:text-gray-800"
                >
                  #{t.name}
                </a>
              ))}
            </div>
          )}
        </main>
      </>

      {/* // <SiteFooter footer={footer} footerMenus={footerMenus} /> */}
    </div>
  );
}
