export const dynamic = "force-dynamic";

export async function GET(request) {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/\/llm\.txt$/, "/llms.txt");

  return Response.redirect(url, 308);
}
