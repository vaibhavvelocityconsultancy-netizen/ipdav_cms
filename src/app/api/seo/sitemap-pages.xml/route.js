// import { getPagesSitemap } from "@/services/sitemap.js";

import { getPagesSitemap } from "@/src/app/lib/services/seo/sitemap.service";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    const xml = await getPagesSitemap(tenantId);

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return new Response("Sitemap not found", { status: 404 });
  }
}
