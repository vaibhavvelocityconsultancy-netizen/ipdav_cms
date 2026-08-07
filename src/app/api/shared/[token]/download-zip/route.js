import { PassThrough } from "stream";
import { ZipArchive } from "archiver";
import { prisma } from "@/src/app/lib/prisma";
import { markZipDownloaded } from "@/src/app/lib/file_sharing/file-sharing.service";
import fs from "fs/promises";
import path from "path";
export async function GET(request, { params }) {
  const { token } = await params;

  if (!token || !String(token).trim()) {
    return new Response("Token is required", { status: 400 });
  }

  const share = await prisma.fileShareLink.findUnique({
    where: { token: String(token) },
    include: { files: { include: { file: true } } },
  });

  if (!share) {
    return new Response("Invalid link", { status: 404 });
  }

  if (!share.files || share.files.length === 0) {
    return new Response("No files in this share", { status: 404 });
  }

  const passthrough = new PassThrough();
  const archive = new ZipArchive({ zlib: { level: 9 } });

  archive.on("error", (err) => {
    passthrough.destroy(err);
  });

  archive.pipe(passthrough);

  // Fetch each file from its stored URL (e.g. Cloudinary) and stream it
  // straight into the zip — nothing is buffered fully in memory at once.
  (async () => {
    try {
      for (const item of share.files) {
        try {
          const relativePath = item.file.url.startsWith("/")
            ? item.file.url.slice(1)
            : item.file.url;

          const filePath = path.join(process.cwd(), "public", relativePath);

          const fileBuffer = await fs.readFile(filePath);

          archive.append(fileBuffer, {
            name: item.file.originalName,
          });
        } catch (err) {
          console.error(`Failed to read file ${item.file.originalName}:`, err);
        }
      }
      await archive.finalize();
    } catch (err) {
      passthrough.destroy(err);
    }
  })();

  // Mark the bulk-download timestamp — fire and forget, doesn't block the stream
  markZipDownloaded(token).catch((err) =>
    console.error("Failed to mark zip download:", err),
  );

  const webStream = new ReadableStream({
    start(controller) {
      passthrough.on("data", (chunk) => controller.enqueue(chunk));
      passthrough.on("end", () => controller.close());
      passthrough.on("error", (err) => controller.error(err));
    },
  });

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="shared-files-${token}.zip"`,
    },
  });
}
