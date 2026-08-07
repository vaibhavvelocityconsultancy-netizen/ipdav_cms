import {
  deleteMedia,
  getMediaById,
  updateMedia,
} from "@/src/app/lib/services/media/media.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { NextResponse } from "next/server";


import fs from "fs/promises";
import path from "path";
// import { getMediaById } from "@/src/app/lib/services/media/media.service";

export async function GET(req, { params }) {
  const { id } = await params;

  const media = await getMediaById(id);

  const filePath = path.join(
    process.cwd(),
    "public",
    media.url
  );

  const file = await fs.readFile(filePath);

  return new Response(file, {
    headers: {
      "Content-Type": media.mimeType,
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
