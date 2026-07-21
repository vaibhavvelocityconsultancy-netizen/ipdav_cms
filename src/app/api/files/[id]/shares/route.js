import { getFileShares } from "@/src/app/lib/file_sharing/file-sharing.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  const shares = await getFileShares(params.id);

  return Response.json(
    new ApiResponse(200, shares, "File shares fetched successfully"),
  );
});
