import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../prisma";
import { requireAuth, requirePermission } from "../withPermission";
import { sendTriggerEmails } from "../email";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import cloudinary from "@/src/lib/cloudinary";
import { requireActiveSubscription } from "../utils/subscription-access";

function generateSharePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[crypto.randomInt(chars.length)];
  }
  return `SHR-${code}`;
}

// ─── Create (multi-file) ────────────────────────────────────

export async function shareFiles(fileIds, { email, message, password }) {
  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    throw new ApiError(400, "At least one file ID is required");
  }

  const uniqueFileIds = [...new Set(fileIds.map(String))];

  const session = await requireActiveSubscription();
  const tenantId = session.user.tenantId;

  // confirm every file exists AND belongs to this tenant
  const files = await prisma.uploadedFile.findMany({
    where: {
      id: {
        in: uniqueFileIds,
      },
      tenantId,
    },
  });

  if (files.length !== uniqueFileIds.length) {
    const foundIds = new Set(files.map((f) => f.id));
    const missing = uniqueFileIds.filter((id) => !foundIds.has(id));
    throw new ApiError(
      404,
      `File(s) not found or not accessible: ${missing.join(", ")}`,
    );
  }

  if (password && password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const plainPassword = password || generateSharePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const share = await prisma.$transaction(async (tx) => {
    const createdShare = await tx.fileShareLink.create({
      data: {
        sharedWith: email,
        message: message ?? null,
        password: hashedPassword,
        createdBy: Number(session.user.id),
      },
    });

    await tx.fileShareFile.createMany({
      data: uniqueFileIds.map((fileId) => ({
        shareLinkId: createdShare.id,
        fileId,
      })),
    });

    return createdShare;
  });

  await sendTriggerEmails("FILE_SHARED", {
    sharedWith: email,
    fileCount: files.length,
    fileTitles: files.map((f) => f.title),
    message: message ?? "",
    link: `${process.env.NEXT_PUBLIC_SITE_URL}/shared/${share.token}`,
    password: plainPassword,
    senderName: session.user.name,
  });

  return { share };
}

// ─── Public access (no auth — token/password gated) ─────────

export async function verifySharePassword(token, password) {
  const share = await prisma.fileShareLink.findUnique({
    where: { token },
    include: {
      files: {
        include: { file: true },
      },
    },
  });
  if (!share) throw new ApiError(404, "Invalid link");

  const valid = await bcrypt.compare(password, share.password);
  if (!valid) throw new ApiError(400, "Incorrect password");

  if (!share.viewedAt) {
    await prisma.fileShareLink.update({
      where: { id: share.id },
      data: { viewedAt: new Date() },
    });
  }

  return {
    sharedWith: share.sharedWith,
    message: share.message,
    files: share.files.map((item) => ({
      itemId: item.id,
      fileId: item.file.id,
      fileUrl: item.file.url,
      mimeType: item.file.mimeType,
      fileName: item.file.originalName,
      title: item.file.title,
      size: item.file.size,
      downloadedAt: item.downloadedAt,
    })),
  };
}

export async function markFileDownloaded(token, fileId) {
  const share = await prisma.fileShareLink.findUnique({ where: { token } });
  if (!share) throw new ApiError(404, "Invalid link");

  const item = await prisma.fileShareFile.findUnique({
    where: {
      shareLinkId_fileId: { shareLinkId: share.id, fileId: String(fileId) },
    },
  });
  if (!item) throw new ApiError(404, "File not part of this share");

  await prisma.fileShareFile.update({
    where: { id: item.id },
    data: { downloadedAt: new Date() },
  });
}

export async function markZipDownloaded(token) {
  const share = await prisma.fileShareLink.findUnique({ where: { token } });
  if (!share) throw new ApiError(404, "Invalid link");

  await prisma.fileShareLink.update({
    where: { id: share.id },
    data: { zipDownloadedAt: new Date() },
  });
}

export async function getShareMeta(token) {
  const share = await prisma.fileShareLink.findUnique({
    where: { token },
    include: {
      files: { include: { file: { select: { title: true, category: true } } } },
    },
  });
  if (!share) throw new ApiError(404, "Invalid link");

  return {
    fileCount: share.files.length,
    files: share.files.map((i) => ({
      title: i.file.title,
      category: i.file.category,
    })),
  };
}

// ─── Shares list per file (admin/subscriber view) ───────────
// Bundle-aware: shows "+N more files" when a share included others

export async function getFileShares(fileId) {
  const session = await requireActiveSubscription();
  const tenantId = session.user.tenantId;

  const file = await prisma.uploadedFile.findFirst({
    where: { id: fileId, tenantId },
  });
  if (!file) throw new ApiError(404, "File not found");

  const items = await prisma.fileShareFile.findMany({
    where: {
      fileId,
      shareLink: {
        createdBy: session.user.id,
      },
    },
    orderBy: {
      shareLink: {
        createdAt: "desc",
      },
    },
    include: {
      shareLink: {
        select: {
          id: true,
          sharedWith: true,
          message: true,
          viewedAt: true,
          zipDownloadedAt: true,
          createdAt: true,
          _count: {
            select: {
              files: true,
            },
          },
        },
      },
    },
  });
  return items.map((item) => ({
    shareId: item.shareLink.id,
    sharedWith: item.shareLink.sharedWith,
    message: item.shareLink.message,
    viewedAt: item.shareLink.viewedAt,
    zipDownloadedAt: item.shareLink.zipDownloadedAt,
    downloadedAt: item.downloadedAt,
    createdAt: item.shareLink.createdAt,
    otherFilesCount: item.shareLink._count.files - 1, // 0 = solo share
  }));
}

// ─── Admin CRUD (unchanged) ──────────────────────────────────

export async function getAllFilesAdmin(fileId) {
  await requirePermission("subscriber_upload_files_info");
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const file = await prisma.uploadedFile.findFirst({
    where: { id: fileId, tenantId },
  });
  if (!file) throw new ApiError(404, "File not found");

  return prisma.uploadedFile.findMany({
    where: { tenantId },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteFileAdmin(fileId) {
  await requirePermission("subscriber_upload_files_info");
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const file = await prisma.uploadedFile.findFirst({
    where: { id: fileId, tenantId },
  });
  if (!file) throw new ApiError(404, "File not found");

  if (file.fileName) {
    try {
      await cloudinary.uploader.destroy(file.fileName, {
        resource_type: getResourceType(file.mimeType),
      });
    } catch (error) {
      throw new ApiError(500, "Failed to delete file from Cloudinary");
    }
  }

  await prisma.uploadedFile.delete({ where: { id: fileId } });

  return ApiResponse(200, null, "File deleted successfully");
}
