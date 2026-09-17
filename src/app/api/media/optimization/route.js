import {
  getOptimizationSettings,
  updateOptimizationSettings,
  getOptimizationStats,
  getOptimizedImagesList,
  bulkOptimizeImages,
} from "../../../lib/services/media/optimization.service";
import { ApiResponse } from "../../../lib/utils/ApiResponse";
import { asyncHandler } from "../../../lib/utils/asyncHandler";

export const runtime = "nodejs";

export const GET = asyncHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const [settings, stats, images] = await Promise.all([
    getOptimizationSettings(),
    getOptimizationStats(),
    getOptimizedImagesList(page, limit),
  ]);

  return Response.json(new ApiResponse(200, { settings, stats, images }, "Optimization data fetched successfully"));
});

export const PUT = asyncHandler(async (req) => {
  const body = await req.json();
  const settings = await updateOptimizationSettings(body);
  return Response.json(new ApiResponse(200, settings, "Optimization settings saved successfully"));
});

export const POST = asyncHandler(async () => {
  const result = await bulkOptimizeImages();
  return Response.json(new ApiResponse(200, result, "Bulk optimization completed"));
});
