import {
  deleteCourseMaterial,
  updateCourseMaterial,
} from "@/src/app/lib/services/course/coursematerial.service";
import { ApiError } from "../../../../lib/utils/ApiError";
import { ApiResponse } from "../../../../lib/utils/ApiResponse";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";

export const PUT = asyncHandler(async (req, { params }) => {
  const { materialId } = await params;
  if (!materialId) throw new ApiError(400, "Material ID is required");

  const input = await req.json();
  const material = await updateCourseMaterial(materialId, input);
  return Response.json(
    new ApiResponse(200, material, "Material updated successfully"),
  );
});

export const DELETE = asyncHandler(async (req, { params }) => {
  const { materialId } = await params;
  if (!materialId) throw new ApiError(400, "Material ID is required");

  await deleteCourseMaterial(materialId);
  return Response.json(
    new ApiResponse(200, null, "Material deleted successfully"),
  );
});
