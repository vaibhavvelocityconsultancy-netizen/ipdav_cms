import { searchContent } from "@/src/app/lib/services/pages/search.service";
import { getPublicSettings } from "@/src/app/lib/services/common_urls/public.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const dynamic = "force-dynamic";

export const GET = asyncHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? searchParams.get("search") ?? "";
  const settings = await getPublicSettings();
  const tenantId = settings?.tenantId;
  if (tenantId === undefined || tenantId === null) {
    throw new ApiError(404, "Public tenant not found");
  }

  const result = await searchContent(query, tenantId);

  return Response.json(
    new ApiResponse(200, result, "Search results fetched successfully"),
  );
});
