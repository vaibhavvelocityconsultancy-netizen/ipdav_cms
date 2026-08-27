import { getSitemapPreview } from "@/src/app/lib/services/seo/sitemap.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";

export const GET = asyncHandler(async (request) => {
  const { session } = await requirePermission("settings_manage");
  const type = new URL(request.url).searchParams.get("type");

  const data = await getSitemapPreview(session.user.tenantId, type);

  return Response.json(new ApiResponse(200, data, "Sitemap preview fetched"), {
    status: 200,
  });
});
