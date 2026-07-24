import { markFileDownloaded } from "@/src/app/lib/file_sharing/file-sharing.service";
import { prisma } from "@/src/app/lib/prisma";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  const { token } = await params;
  if (!token) throw new ApiError(400, "Token is required");

  const share = await prisma.fileShare.findUnique({
    where: { token },
    include: { items: { include: { file: true } } },
  });

  const item = share?.items?.[0];
  if (!item) throw new ApiError(404, "Invalid link or no files in this share");

  await markFileDownloaded(token, item.fileId);

  const res = await fetch(item.file.url);
  const blob = await res.arrayBuffer();

  return new Response(blob, {
    headers: {
      "Content-Type": item.file.mimeType,
      "Content-Disposition": `attachment; filename="${item.file.originalName}"`,
    },
  });
});
