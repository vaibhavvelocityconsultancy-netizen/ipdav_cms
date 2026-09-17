import { optimizeSingleImage } from "../../../../lib/services/media/optimization.service";
import { ApiResponse } from "../../../../lib/utils/ApiResponse";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";

export const runtime = "nodejs";

export const POST = asyncHandler(async (_req, { params }) => {
  const { id } = await params;
  const media = await optimizeSingleImage(id);
  return Response.json(new ApiResponse(200, media, "Image optimized successfully"));
});
