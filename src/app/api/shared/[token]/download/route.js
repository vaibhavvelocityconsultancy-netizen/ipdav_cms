import { markShareDownloaded } from "@/src/app/lib/file_sharing/file-sharing.service";
import { prisma } from "@/src/app/lib/prisma";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  const { token } = await params;
  if (!token) throw new ApiError(400, "Token is required");

  const share = await prisma.fileShare.findUnique({
    where: { token },
    include: { file: true },
  });

  if (!share) throw new ApiError(404, "Invalid link");

  await markShareDownloaded(token);

  const res = await fetch(share.file.url);
  const blob = await res.arrayBuffer();

  return new Response(blob, {
    headers: {
      
      "Content-Type": share.file.mimeType,
      "Content-Disposition": `attachment; filename="${share.file.originalName}"`,
    },
  });
});