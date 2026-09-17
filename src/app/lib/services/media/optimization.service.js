import { prisma } from "../../prisma";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { ApiError } from "../../utils/ApiError";
import { requirePermission, requireAuth } from "../../withPermission";
import { getTenantFileUrl, getTenantUploadDir } from "../../utils/uploadconfig";

// ─────────────────────────────────────────────
// GET OPTIMIZATION SETTINGS
// ─────────────────────────────────────────────
export async function getOptimizationSettings() {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  let settings = await prisma.imageOptimizationSettings.findUnique({
    where: { tenantId },
  });

  if (!settings) {
    settings = await prisma.imageOptimizationSettings.create({
      data: {
        tenantId,
        automatic: true,
        compression: true,
        quality: 80,
        maxWidth: 1920,
        maxHeight: 1080,
        keepOriginal: false,
      },
    });
  }

  return settings;
}

// ─────────────────────────────────────────────
// UPDATE OPTIMIZATION SETTINGS
// ─────────────────────────────────────────────
export async function updateOptimizationSettings(input) {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const settings = await prisma.imageOptimizationSettings.upsert({
    where: { tenantId },
    update: {
      automatic: input.automatic ?? undefined,
      compression: input.compression ?? undefined,
      quality: input.quality ?? undefined,
      maxWidth: input.maxWidth ?? undefined,
      maxHeight: input.maxHeight ?? undefined,
      keepOriginal: input.keepOriginal ?? undefined,
    },
    create: {
      tenantId,
      automatic: input.automatic ?? true,
      compression: input.compression ?? true,
      quality: input.quality ?? 80,
      maxWidth: input.maxWidth ?? 1920,
      maxHeight: input.maxHeight ?? 1080,
      keepOriginal: input.keepOriginal ?? false,
    },
  });

  return settings;
}

// ─────────────────────────────────────────────
// GET OPTIMIZATION STATISTICS
// ─────────────────────────────────────────────
export async function getOptimizationStats() {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const [total, optimized, pending, failed] = await Promise.all([
    prisma.media.count({
      where: { tenantId },
    }),
    prisma.media.count({
      where: {
        tenantId,
        optimizationStatus: "OPTIMIZED",
      },
    }),
    prisma.media.count({
      where: {
        tenantId,
        optimizationStatus: "PENDING",
      },
    }),
    prisma.media.count({
      where: {
        tenantId,
        optimizationStatus: "FAILED",
      },
    }),
  ]);

  const savedStats = await prisma.media.aggregate({
    where: {
      tenantId,
      optimizationStatus: "OPTIMIZED",
      originalSize: { not: null },
      optimizedSize: { not: null },
    },
    _sum: {
      originalSize: true,
      optimizedSize: true,
    },
  });

  const originalTotal = savedStats._sum.originalSize || 0;
  const optimizedTotal = savedStats._sum.optimizedSize || 0;
  const saved = originalTotal - optimizedTotal;

  return {
    total,
    optimized,
    pending,
    failed,
    storageSavedBytes: saved,
    storageSavedMB: (saved / (1024 * 1024)).toFixed(2),
  };
}

// ─────────────────────────────────────────────
// OPTIMIZE SINGLE IMAGE
// ─────────────────────────────────────────────
export async function optimizeSingleImage(mediaId, settings = null) {
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const media = await prisma.media.findUnique({
    where: { id: Number(mediaId), tenantId },
  });

  if (!media) {
    throw new ApiError(404, "Media not found");
  }

  if (!media.mimeType?.startsWith("image/")) {
    throw new ApiError(400, "File is not an image");
  }

  const opts = settings || (await getOptimizationSettings());
  const tenantDir = getTenantUploadDir(tenantId);
  const filePath = path.join(tenantDir, media.publicId);

  try {
    const buffer = await fs.readFile(filePath);

    const originalMetadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;
    const originalWidth = originalMetadata.width;
    const originalHeight = originalMetadata.height;

    let optimizedBuffer = buffer;
    let optimizedFormat = media.mimeType;

    if (opts.compression && (media.mimeType === "image/jpeg" || media.mimeType === "image/png" || media.mimeType === "image/webp")) {
      let sharpPipeline = sharp(buffer);

      if (opts.maxWidth || opts.maxHeight) {
        sharpPipeline = sharpPipeline.resize(opts.maxWidth, opts.maxHeight, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      optimizedBuffer = await sharpPipeline
        .webp({ quality: opts.quality })
        .toBuffer();

      optimizedFormat = "image/webp";

      if (opts.keepOriginal && media.publicId) {
        const ext = path.extname(media.publicId);
        const backup = media.publicId.replace(ext, `-original${ext}`);
        const backupPath = path.join(tenantDir, backup);

        try {
          await fs.copyFile(filePath, backupPath);
        } catch (err) {
          console.error("Failed to backup original:", err);
        }
      }
    }

    const optimizedSize = optimizedBuffer.length;
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();
    const optimizedWidth = optimizedMetadata.width;
    const optimizedHeight = optimizedMetadata.height;

    const compressionPercent =
      originalSize > 0 ? ((originalSize - optimizedSize) / originalSize) * 100 : 0;

    await fs.writeFile(filePath, optimizedBuffer);

    const updatedMedia = await prisma.media.update({
      where: { id: Number(mediaId) },
      data: {
        originalFormat: media.mimeType,
        optimizedFormat,
        originalSize,
        optimizedSize,
        compressionPercent: parseFloat(compressionPercent.toFixed(2)),
        originalWidth,
        originalHeight,
        optimizedWidth,
        optimizedHeight,
        optimizationStatus: "OPTIMIZED",
        optimizedAt: new Date(),
        optimizationError: null,
        mimeType: optimizedFormat,
        size: optimizedSize,
        width: optimizedWidth,
        height: optimizedHeight,
      },
    });

    return updatedMedia;
  } catch (error) {
    await prisma.media.update({
      where: { id: Number(mediaId) },
      data: {
        optimizationStatus: "FAILED",
        optimizationError: error.message,
      },
    });

    throw new ApiError(500, `Optimization failed: ${error.message}`);
  }
}

// ─────────────────────────────────────────────
// BULK OPTIMIZE PENDING IMAGES
// ─────────────────────────────────────────────
export async function bulkOptimizeImages() {
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const settings = await getOptimizationSettings();

  const pendingImages = await prisma.media.findMany({
    where: {
      tenantId,
      optimizationStatus: "PENDING",
      mimeType: { in: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"] },
    },
    take: 100,
  });

  const results = {
    total: pendingImages.length,
    optimized: 0,
    failed: 0,
    failures: [],
  };

  for (const media of pendingImages) {
    try {
      await optimizeSingleImage(media.id, settings);
      results.optimized++;
    } catch (error) {
      results.failed++;
      results.failures.push({
        id: media.id,
        fileName: media.fileName,
        error: error.message,
      });
    }
  }

  return results;
}

// ─────────────────────────────────────────────
// GET OPTIMIZED IMAGES LIST
// ─────────────────────────────────────────────
export async function getOptimizedImagesList(page = 1, limit = 20) {
  await requirePermission("media_upload");

  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const items = await prisma.media.findMany({
    where: {
      tenantId,
      optimizationStatus: { in: ["OPTIMIZED", "FAILED", "PENDING"] },
      mimeType: { startsWith: "image/" },
    },
    orderBy: { optimizedAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.media.count({
    where: {
      tenantId,
      optimizationStatus: { in: ["OPTIMIZED", "FAILED", "PENDING"] },
      mimeType: { startsWith: "image/" },
    },
  });

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
