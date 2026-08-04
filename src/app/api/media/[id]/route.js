import {
  deleteMedia,
  getMediaById,
  updateMedia,
} from "@/src/app/lib/services/media/media.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { ApiError } from "@/src/app/lib/utils/ApiError";


export const GET = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const media = await getMediaById(id);
  const requestUrl = new URL(req.url);
  const sourceUrl = media.url ? new URL(media.url, requestUrl.origin) : null;
  const isProxyUrl =
    sourceUrl &&
    sourceUrl.origin === requestUrl.origin &&
    /\/api\/media\/\d+$/.test(sourceUrl.pathname);

  if (!sourceUrl || isProxyUrl) {
    throw new ApiError(
      422,
      "Media source URL is missing. Restore the original Cloudinary URL for this media item.",
    );
  }

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to fetch media source");
  }

  return new Response(response.body, {
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") ||
        media.mimeType ||
        "application/octet-stream",
      ...(response.headers.get("Content-Length")
        ? { "Content-Length": response.headers.get("Content-Length") }
        : {}),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

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
