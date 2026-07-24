import {
  deleteMedia,
  getMediaById,
  updateMedia,
} from "@/src/app/lib/services/media/media.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
  const media = await getMediaById(params.id);

  const response = await fetch(media.url);

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type"),
      "Content-Length": response.headers.get("Content-Length") ?? "",
    },
  });
}

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
