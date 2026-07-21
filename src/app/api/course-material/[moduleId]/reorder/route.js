// import { reorderCourseMaterials } from "../../../../lib/services/courseMaterial.service";
import { reorderCourseMaterials } from "@/src/app/lib/services/course/coursematerial.service";
import { ApiError } from "../../../../lib/utils/ApiError";
import { ApiResponse } from "../../../../lib/utils/ApiResponse";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";

export const PUT = asyncHandler(async (req, { params }) => {
  const { moduleId } = params;
  if (!moduleId) throw new ApiError(400, "Module ID is required");

  const { items } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Items array is required");
  }

  const materials = await reorderCourseMaterials(moduleId, items);
  return Response.json(
    new ApiResponse(200, materials, "Materials reordered successfully"),
  );
});
