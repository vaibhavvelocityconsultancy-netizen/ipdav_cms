import fs from "fs/promises";
import path from "path";
import { uploadRoot } from "@/src/app/lib/utils/uploadconfig";

export const runtime = "nodejs";

const CONTENT_TYPES = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export async function GET(req, { params }) {
  const { path: segments = [] } = await params;
  const relativePath = segments.join("/");
  const uploadPath = path.resolve(uploadRoot, relativePath);

  if (
    uploadPath !== uploadRoot &&
    !uploadPath.startsWith(`${uploadRoot}${path.sep}`)
  ) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(uploadPath);
    const contentType =
      CONTENT_TYPES[path.extname(uploadPath).toLowerCase()] ||
      "application/octet-stream";

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "EISDIR") {
      return new Response("Not found", { status: 404 });
    }

    throw error;
  }
}
