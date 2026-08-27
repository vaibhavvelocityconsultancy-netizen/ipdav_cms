export async function GET(request) {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/\/sitemap\.xml$/, "/sitemap_index.xml");

  return Response.redirect(url, 308);
}
