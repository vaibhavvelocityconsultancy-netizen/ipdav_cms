import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../prisma";
import { requireAuth, requirePermission } from "../withPermission";
import { sendTriggerEmails } from "../email";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import cloudinary from "@/src/lib/cloudinary";

function generateSharePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[crypto.randomInt(chars.length)];
  }
  return `SHR-${code}`;
}

// ─── Share ────────────────────────────────────────────────

export async function shareFile(fileId, { email, message, password }) {
  if (!fileId) {
    throw new ApiError(400, "File ID is required");
  }

  const normalizedFileId = String(fileId);
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const file = await prisma.sharedFile.findFirst({
    where: { id: normalizedFileId, tenantId },
  });
  if (!file) throw new ApiError(404, "File not found");

  if (password && password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const plainPassword = password || generateSharePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const share = await prisma.fileShare.create({
    data: {
      fileId: normalizedFileId,
      sharedWith: email,
      message: message ?? null,
      password: hashedPassword,
      sharedBy: Number(session.user.id),
    },
  });

  await sendTriggerEmails("FILE_SHARED", {
    sharedWith: email,
    title: file.title,
    category: file.category,
    message: message ?? "",
    link: `${process.env.NEXT_PUBLIC_BASE_URL}/shared/${share.token}`,
    password: plainPassword,
    senderName: session.user.name, // add this
  });

  return { share };
}

// ─── Public access (no auth — token/password gated) ────────

export async function verifySharePassword(token, password) {
  const share = await prisma.fileShare.findUnique({
    where: { token },
    include: { file: true },
  });
  if (!share) throw new ApiError(404, "Invalid link");

  const valid = await bcrypt.compare(password, share.password);
  if (!valid) throw new ApiError(400, "Incorrect password");

  if (!share.viewedAt) {
    await prisma.fileShare.update({
      where: { id: share.id },
      data: { viewedAt: new Date() },
    });
  }

  return {
    fileUrl: share.file.url,
    mimeType: share.file.mimeType,
    fileName: share.file.originalName,
    title: share.file.title,
  };
}

export async function markShareDownloaded(token) {
  const share = await prisma.fileShare.findUnique({ where: { token } });
  if (!share) throw new ApiError(404, "Invalid link");

  await prisma.fileShare.update({
    where: { id: share.id },
    data: { downloadedAt: new Date() },
  });
}

export async function getShareMeta(token) {
  const share = await prisma.fileShare.findUnique({
    where: { token },
    include: { file: true },
  });
  if (!share) throw new ApiError(404, "Invalid link");

  return { title: share.file.title, category: share.file.category };
}

// ─── Shares list per file (for admin/subscriber view) ─────

export async function getFileShares(fileId) {
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  const file = await prisma.sharedFile.findFirst({
    where: { id: fileId, tenantId },
  });
  if (!file) throw new ApiError(404, "File not found");

  return prisma.fileShare.findMany({
    where: { fileId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      sharedWith: true,
      message: true,
      viewedAt: true,
      downloadedAt: true,
      createdAt: true,
    },
  });
}

// Admin CRUDS

export async function getAllFilesAdmin(fileId) {
  await requirePermission("subscriber_upload_files_info");
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  // check if the file exists and belongs to the tenant

  const file = await prisma.sharedFile.findFirst({
    where: { id: fileId, tenantId },
  });
  if (!file) throw new ApiError(404, "File not found");

  return prisma.sharedFile.findMany({
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

// delete file by id
export async function deleteFileAdmin(fileId) {
  await requirePermission("subscriber_upload_files_info");
  const session = await requireAuth();
  const tenantId = session.user.tenantId;

  // check if the file exists and belongs to the tenant
  const file = await prisma.sharedFile.findFirst({
    where: { id: fileId, tenantId },
  });
  if (!file) throw new ApiError(404, "File not found");

  if (file.fileName) {
    // delete the file from cloudinary
    try {
      // Delete the file from Cloudinary
      await cloudinary.uploader.destroy(file.fileName, {
        resource_type: getResourceType(file.mimeType),
      });
    } catch (error) {
      throw new ApiError(500, "Failed to delete file from Cloudinary");
    }
  }

  await prisma.sharedFile.delete({ where: { id: fileId } });

  return ApiResponse(200, null, "File deleted successfully");
}
