import { prisma } from "@/src/app/lib/prisma";
import { requireAuth } from "@/src/app/lib/withPermission";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { getFileByIdAdmin, getFileShares, updateFileAdmin } from "@/src/app/lib/file_sharing/file-sharing.service";

export const GET = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const file = await getFileByIdAdmin(id);
  return Response.json(new ApiResponse(200, file, "File fetched successfully"));
});

export const PUT = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();

  const file = await updateFileAdmin(id, body);
  return Response.json(new ApiResponse(200, file, "File updated successfully"));
});

export const DELETE = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  await deleteFileAdmin(id);
  return Response.json(new ApiResponse(200, null, "File deleted successfully"));
});