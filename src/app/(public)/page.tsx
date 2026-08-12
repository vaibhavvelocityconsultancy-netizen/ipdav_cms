import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import HomeClient from "./_home-client";
import { fetchers } from "@/src/lib/fetchers";
import { queryKeys } from "@/src/lib/query-key";
import { processPublicPageHtml } from "@/src/lib/public-page-html";

export default async function Page() {
  const queryClient = new QueryClient();

  // Attempt to prefetch queries with timeout to prevent build hanging
  // If queries fail or timeout, render without hydration (client will fetch)
  try {
    const timeoutMs = 5000; // 5-second timeout per query
    await Promise.allSettled([
      Promise.race([
        queryClient.prefetchQuery({
          queryKey: ["public", "bootstrap"],
          queryFn: fetchers.publicBootstrap,
          staleTime: 60_000,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs),
        ),
      ]),

      Promise.race([
        queryClient.prefetchQuery({
          queryKey: queryKeys.posts,
          queryFn: fetchers.publicPosts,
          staleTime: 60_000,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs),
        ),
      ]),

      Promise.race([
        queryClient.prefetchQuery({
          queryKey: queryKeys.globalCss,
          queryFn: fetchers.globalCss,
          staleTime: Infinity,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs),
        ),
      ]),

      Promise.race([
        queryClient.prefetchQuery({
          queryKey: queryKeys.globalJs,
          queryFn: fetchers.globalJs,
          staleTime: Infinity,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeoutMs),
        ),
      ]),
    ]);
  } catch (error) {
    // Silently fail during build; client will fetch on hydration
    console.error("Prefetch failed (expected during build):", error);
  }

  // after your existing prefetch block, add:
  const bootstrapData = queryClient.getQueryData<any>(["public", "bootstrap"]);
  const homepage = bootstrapData?.data?.homepage;
  const page = homepage?.type === "page" ? homepage?.page : null;
  const breadcrumbSettings = bootstrapData?.data?.breadcrumbSettings;

  let initialProcessedHtml = "";
  let initialHasForms = false;

  if (page?.html) {
    try {
      const serverBaseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : `http://localhost:3000`);

      const { html, hasForms } = await processPublicPageHtml(page.html, {
        breadcrumbItems: [],
        breadcrumbSettings,
        baseUrl: serverBaseUrl,
        context: { isHome: true, is404: false, isSearch: false },
      });
      initialProcessedHtml = html;
      initialHasForms = hasForms;
    } catch (error) {
      console.error("Server-side page HTML processing failed:", error);
    }
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient
        initialProcessedHtml={initialProcessedHtml}
        initialHasForms={initialHasForms}
      />
    </HydrationBoundary>
  );
}
