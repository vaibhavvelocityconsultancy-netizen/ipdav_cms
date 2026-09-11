import { getPublicPopups } from "@/src/app/lib/services/popups/popup.service";
import { getPublicSettings } from "@/src/app/lib/services/common_urls/public.service";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const settings = await getPublicSettings();
  const data = await getPublicPopups(settings?.tenantId, searchParams.get("page") || "");
  return Response.json({ success: true, data });
}
