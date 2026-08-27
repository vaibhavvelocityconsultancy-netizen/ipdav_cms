import { getSitemapIndex } from "../lib/services/seo/sitemap.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const xml = await getSitemapIndex();

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Sitemap Error:", error);

    return new Response("Unable to generate sitemap.", {
      status: 500,
    });
  }
}
