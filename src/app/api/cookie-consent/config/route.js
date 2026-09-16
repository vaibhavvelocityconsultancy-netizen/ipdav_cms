import { getPublicCookieConfig } from "../../../lib/services/settings/cookie-consent.service";
export async function GET() { return Response.json({ success: true, data: await getPublicCookieConfig() }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } }); }
