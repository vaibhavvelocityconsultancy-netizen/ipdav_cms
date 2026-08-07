import { prisma } from "../../prisma";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { ApiError } from "../../utils/ApiError";
import { requirePermission, requireAuth } from "../../withPermission";
import { getTenantFileUrl, getTenantUploadDir } from "../../utils/uploadconfig";
// import { getTenantUploadDir, getTenantFileUrl } from "../../lib/uploadConfig";

// Allowed MIME Types
const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Video
  "video/mp4",
  "video/webm",

  // Audio
  "audio/mpeg",
  "audio/wav",
];

function generateTitleFromFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function generateSafeFileName(originalName) {
  const ext = path.extname(originalName);
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

  return `${base}-${crypto.randomBytes(6).toString("hex")}${ext}`;
}

// ─────────────────────────────────────────────
// CREATE MEDIA
// ─────────────────────────────────────────────
export async function createMedia(input) {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const files = Array.isArray(input) ? input : [input];
  const uploadedMedia = [];

  const tenantDir = getTenantUploadDir(tenantId);
  await fs.mkdir(tenantDir, { recursive: true });

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(400, `Unsupported file type: ${file.type}`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let width = null;
    let height = null;

    if (file.type.startsWith("image/") && file.type !== "image/svg+xml") {
      const metadata = await sharp(buffer).metadata();
      width = metadata.width ?? null;
      height = metadata.height ?? null;
    }

    const fileName = generateSafeFileName(file.name);
    const filePath = path.join(tenantDir, fileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = getTenantFileUrl(tenantId, fileName);
    const generatedTitle = generateTitleFromFilename(file.name);

    const media = await prisma.media.create({
      data: {
        fileName,
        originalName: file.name,
        url: publicUrl,
        publicId: fileName,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        title: generatedTitle,
        tenantId,
      },
    });

    uploadedMedia.push(media);
  }

  return Array.isArray(input) ? uploadedMedia : uploadedMedia[0];
}

// ─────────────────────────────────────────────
// GET ALL MEDIA
// ─────────────────────────────────────────────
export async function getAllMedia({ page = 1, limit = 20, search = "" }) {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  page = Number(page);
  limit = Number(limit);

  const where = {
    tenantId: tenantId,
    ...(search && {
      OR: [
        { fileName: { contains: search } },
        { originalName: { contains: search } },
        { title: { contains: search } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.media.count({ where }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─────────────────────────────────────────────
// UPDATE MEDIA META
// ─────────────────────────────────────────────
export async function updateMedia(id, input) {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const existingMedia = await prisma.media.findUnique({
    where: {
      id: Number(id),
      tenantId: tenantId,
    },
  });

  if (!existingMedia) {
    throw new ApiError(404, "Media not found");
  }

  const { tenantId: inputTenantId, ...updateData } = input;

  return prisma.media.update({
    where: {
      id: Number(id),
      tenantId: tenantId,
    },
    data: {
      altText: updateData.altText ?? null,
      title: updateData.title ?? null,
      caption: updateData.caption ?? null,
      description: updateData.description ?? null,
    },
  });
}

// ─────────────────────────────────────────────
// DELETE MEDIA
// ─────────────────────────────────────────────
export async function deleteMedia(id) {
  await requirePermission("media_delete");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const media = await prisma.media.findUnique({
    where: {
      id: Number(id),
      tenantId,
    },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  if (media.publicId) {
    const filePath = path.join(getTenantUploadDir(tenantId), media.publicId);

    try {
      await fs.unlink(filePath);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error("Media file delete failed:", err);
      }
    }
  }

  await prisma.media.delete({
    where: {
      id: Number(id),
      tenantId,
    },
  });

  return true;
}

// ─────────────────────────────────────────────
// BULK DELETE MEDIA
// ─────────────────────────────────────────────
export async function bulkDeleteMedia(ids) {
  await requirePermission("media_delete");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "Invalid or empty ids array provided");
  }

  const numericIds = ids.map(Number);

  const mediaItems = await prisma.media.findMany({
    where: {
      id: {
        in: numericIds,
      },
      tenantId: tenantId,
    },
    select: {
      id: true,
      publicId: true,
      mimeType: true,
    },
  });

  const foundIds = mediaItems.map((m) => m.id);
  const missingIds = numericIds.filter((id) => !foundIds.includes(id));

  if (missingIds.length > 0) {
    throw new ApiError(
      404,
      `Some media items not found or belong to different tenant: ${missingIds.join(", ")}`,
    );
  }

  const tenantDir = getTenantUploadDir(tenantId);

  await Promise.allSettled(
    mediaItems.map((media) =>
      fs.unlink(path.join(tenantDir, media.publicId)).catch(() => {}),
    ),
  );

  const result = await prisma.media.deleteMany({
    where: {
      id: {
        in: numericIds,
      },
      tenantId: tenantId,
    },
  });

  return {
    deleted: result.count,
    totalRequested: ids.length,
  };
}

// ─────────────────────────────────────────────
// GET MEDIA BY ID
// ─────────────────────────────────────────────
export async function getMediaById(id) {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const media = await prisma.media.findUnique({
    where: {
      id: Number(id),
      tenantId: tenantId,
    },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  return media;
}

// ─────────────────────────────────────────────
// GET MEDIA STATISTICS
// ─────────────────────────────────────────────
export async function getMediaStats() {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const [total, byType, totalSize] = await Promise.all([
    prisma.media.count({
      where: { tenantId },
    }),
    prisma.media.groupBy({
      by: ["mimeType"],
      where: { tenantId },
      _count: true,
    }),
    prisma.media.aggregate({
      where: { tenantId },
      _sum: {
        size: true,
      },
    }),
  ]);

  return {
    total,
    byType: byType.map((type) => ({
      mimeType: type.mimeType,
      count: type._count,
    })),
    totalSizeBytes: totalSize._sum.size || 0,
    totalSizeMB: ((totalSize._sum.size || 0) / (1024 * 1024)).toFixed(2),
  };
}