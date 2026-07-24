import { prisma } from "@/src/app/lib/prisma";
import { requireAuth } from "@/src/app/lib/withPermission";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { getFileShares } from "@/src/app/lib/file_sharing/file-sharing.service";

export const DELETE = asyncHandler(async (req, { params }) => {
  const { user } = await requireAuth();
  const fileId = String(params.id);

  const existing = await prisma.uploadedFile.findFirst({
    where: { id: fileId, tenantId: Number(user.tenantId) },
  });

  if (!existing) {
    throw new ApiError(404, "File not found");
  }

  await prisma.uploadedFile.delete({ where: { id: fileId } });

  return Response.json(new ApiResponse(200, null, "File deleted successfully"));
});

export const GET = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  if (!id) throw new ApiError(400, "File ID is required");

  const shares = await getFileShares(id);
  return Response.json(
    new ApiResponse(200, shares, "Shares fetched successfully"),
  );
});
