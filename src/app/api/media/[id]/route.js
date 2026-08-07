import fs from "fs/promises";
import path from "path";
import {
  getTenantUploadDir,
} from "@/src/app/lib/utils/uploadconfig";

export async function GET(req, { params }) {
  const { id } = await params;

  const media = await getMediaById(id);

  // Read from the actual upload directory
  const filePath = path.join(
    getTenantUploadDir(media.tenantId),
    media.publicId
  );

  const file = await fs.readFile(filePath);

  return new Response(file, {
    headers: {
      "Content-Type": media.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}