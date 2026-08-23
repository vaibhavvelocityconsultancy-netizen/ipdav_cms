import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import HomeClient from "./_home-client";
import { fetchers } from "@/src/lib/fetchers";
import { queryKeys } from "@/src/lib/query-key";
import { processPublicPageHtml } from "@/src/lib/public-page-html";
import { enrichHtmlWithMediaDimensions } from "@/src/lib/media-dimensions.server";

export default async function Page() {
  const queryClient = new QueryClient();

  try {
    const timeoutMs = 5000;
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
    console.error("Prefetch failed (expected during build):", error);
  }

  const bootstrapData = queryClient.getQueryData<any>(["public", "bootstrap"]);
  const homepage = bootstrapData?.data?.homepage;
  const page = homepage?.type === "page" ? homepage?.page : null;
  const breadcrumbSettings = bootstrapData?.data?.breadcrumbSettings;

  let initialProcessedHtml = "";
  let initialHasForms = false;

  if (page?.html) {
    try {
      const serverBaseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000`;

      console.log("DEBUG serverBaseUrl:", serverBaseUrl);

      // temporarily add in page.tsx, right where serverBaseUrl is set
      console.log("DEBUG serverBaseUrl:", serverBaseUrl);

      const { html, hasForms } = await processPublicPageHtml(page.html, {
        breadcrumbItems: [],
        breadcrumbSettings,
        baseUrl: serverBaseUrl,
        context: { isHome: true, is404: false, isSearch: false },
      });
      initialProcessedHtml = await enrichHtmlWithMediaDimensions(html);
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
