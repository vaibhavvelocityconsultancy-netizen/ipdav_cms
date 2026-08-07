import { prisma } from "../../prisma";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { ApiError } from "../../utils/ApiError";
import { requirePermission, requireAuth } from "../../withPermission";
import crypto from "crypto";

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

// Add this helper at the top

function generateTitleFromFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────
// CREATE MEDIA
// ─────────────────────────────────────────────
export async function createMedia(input) {
  await requirePermission("media_upload");

  // Get tenantId from authenticated session
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const files = Array.isArray(input) ? input : [input];

  const uploadedMedia = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(400, `Unsupported file type: ${file.type}`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let width = null;
    let height = null;

    if (file.type.startsWith("image/")) {
      const metadata = await sharp(buffer).metadata();

      width = metadata.width ?? null;
      height = metadata.height ?? null;
    }
    const tenantDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      `tenant-${tenantId}`,
    );

    console.log("===== UPLOAD DEBUG =====");
    console.log("cwd:", process.cwd());
    console.log("tenantDir:", tenantDir);
    console.log("filePath:", filePath);

    await fs.mkdir(tenantDir, { recursive: true });

    console.log("Directory created");

    await fs.writeFile(filePath, buffer);

    console.log("File written");
    console.log("========================");
    const ext = path.extname(file.name);

    const base = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();

    const fileName = `${base}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const filePath = path.join(tenantDir, fileName);

    await fs.writeFile(filePath, buffer);
    console.log("process.cwd():", process.cwd());
    // console.log("Upload directory:", uploadDir);
    console.log("File path:", filePath);

    const publicUrl = `/uploads/tenant-${tenantId}/${fileName}`;

    const generatedTitle = generateTitleFromFilename(file.name);

    const media = await prisma.media.create({
      data: {
        fileName: fileName,
        originalName: file.name,
        url: publicUrl,
        publicId: fileName,

        mimeType: file.type,
        size: file.size,

        width,
        height,

        title: generatedTitle,
        // Always use tenantId from session
        tenantId: tenantId,
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

  // Get tenantId from authenticated session
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  page = Number(page);
  limit = Number(limit);

  // Build where clause with tenant isolation
  const where = {
    tenantId: tenantId, // Always filter by tenant
    ...(search && {
      OR: [
        {
          fileName: {
            contains: search,
          },
        },
        {
          originalName: {
            contains: search,
          },
        },
        {
          title: {
            contains: search,
          },
        },
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

  // Get tenantId from authenticated session
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  // First verify media belongs to current tenant
  const existingMedia = await prisma.media.findUnique({
    where: {
      id: Number(id),
      tenantId: tenantId, // Tenant check
    },
  });

  if (!existingMedia) {
    throw new ApiError(404, "Media not found");
  }

  // Never trust tenantId from input - only update allowed fields
  const { tenantId: inputTenantId, ...updateData } = input;

  return prisma.media.update({
    where: {
      id: Number(id),
      tenantId: tenantId, // Extra safety in where clause
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
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      `tenant-${tenantId}`,
      media.publicId,
    );

    console.log("========== DELETE DEBUG ==========");
    console.log("process.cwd():", process.cwd());
    console.log("tenantId:", tenantId);
    console.log("publicId:", media.publicId);
    console.log("filePath:", filePath);

    try {
      await fs.access(filePath);
      console.log("✅ File exists");

      await fs.unlink(filePath);
      console.log("✅ File deleted successfully");
    } catch (err) {
      console.error("❌ File delete failed");
      console.error(err);
    }

    console.log("==================================");
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

  // Get tenantId from authenticated session
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "Invalid or empty ids array provided");
  }

  // Convert ids to numbers
  const numericIds = ids.map(Number);

  // First, verify all media items belong to current tenant
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
  await Promise.allSettled(
    mediaItems.map((media) =>
      fs
        .unlink(
          path.join(
            process.cwd(),
            "public",
            "uploads",
            `tenant-${tenantId}`,
            media.publicId,
          ),
        )
        .catch(() => {}),
    ),
  );
  // Delete all media items from database
  const result = await prisma.media.deleteMany({
    where: {
      id: {
        in: numericIds,
      },
      tenantId: tenantId, // Extra safety: only delete tenant's media
    },
  });

  return {
    deleted: result.count,
    totalRequested: ids.length,
  };
}

// ─────────────────────────────────────────────
// GET MEDIA BY ID (Helper function)
// ─────────────────────────────────────────────
export async function getMediaById(id) {
  await requirePermission("media_upload");

  // Get tenantId from authenticated session
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
// GET MEDIA STATISTICS (Optional helper)
// ─────────────────────────────────────────────
export async function getMediaStats() {
  await requirePermission("media_upload");

  // Get tenantId from authenticated session
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
