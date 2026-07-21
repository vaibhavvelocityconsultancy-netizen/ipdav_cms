import {
  addCourseMaterial,
  getModuleMaterials,
} from "@/src/app/lib/services/course/coursematerial.service";
import { ApiError } from "../../../lib/utils/ApiError";
import { ApiResponse } from "../../../lib/utils/ApiResponse";
import { asyncHandler } from "../../../lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  const { moduleId } = await params;
  if (!moduleId) throw new ApiError(400, "Module ID is required");

  const materials = await getModuleMaterials(moduleId);
  return Response.json(
    new ApiResponse(200, materials, "Materials fetched successfully"),
  );
});

export const POST = asyncHandler(async (req, { params }) => {
  const { moduleId } = await params;
  if (!moduleId) throw new ApiError(400, "Module ID is required");

  const input = await req.json();
  const material = await addCourseMaterial(moduleId, input);
  return Response.json(
    new ApiResponse(200, material, "Material added successfully"),
    { status: 201 },
  );
});
