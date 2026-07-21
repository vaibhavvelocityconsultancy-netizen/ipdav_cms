import {
  deleteMedia,
  updateMedia,
} from "@/src/app/lib/services/media/media.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const DELETE = asyncHandler(async (req, { params }) => {
  const { id } = await params;

  await deleteMedia(id);

  return Response.json(
    new ApiResponse(200, null, "Media deleted successfully"),
  );
});

export const PATCH = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();

  const media = await updateMedia(id, body);

  return Response.json(
    new ApiResponse(200, media, "Media updated successfully"),
  );
});
