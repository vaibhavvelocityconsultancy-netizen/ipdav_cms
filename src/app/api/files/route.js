import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../lib/withPermission";
import { ApiError } from "../../lib/utils/ApiError";
import { ApiResponse } from "../../lib/utils/ApiResponse";
import { asyncHandler } from "../../lib/utils/asyncHandler";
import cloudinary from "@/src/lib/cloudinary";
import { requireActiveSubscription } from "../../lib/utils/subscription-access";

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
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",

  // Video
  "video/mp4",
  "video/webm",

  // Audio
  "audio/mpeg",
  "audio/wav",
];

function getResourceType(mimeType) {
  if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) {
    return "video";
  }

  if (
    mimeType === "application/pdf" ||
    mimeType === "application/msword" ||
    mimeType.includes("officedocument") ||
    mimeType === "application/zip" ||
    mimeType === "text/plain"
  ) {
    return "raw";
  }

  return "image";
}

function generateTitleFromFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const GET = asyncHandler(async () => {
  const { user } = await requireAuth();

  const files = await prisma.uploadedFile.findMany({
    where: {
      
      tenantId: Number(user.tenantId),
      uploadedBy: Number(user.id),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(
    new ApiResponse(200, files, "Files fetched successfully"),
  );
});

export const POST = asyncHandler(async (req) => {
  const { user } = await requireAuth();
  await requireActiveSubscription(user.id);

  const formData = await req.formData();
  const file = formData.get("file") ?? formData.getAll("files")[0];

  if (!file || typeof file === "string") {
    throw new ApiError(400, "File is required");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError(400, `Unsupported file type: ${file.type}`);
  }

  const title =
    (formData.get("title")?.toString().trim() || "").trim() ||
    generateTitleFromFilename(file.name);
  const category = formData.get("category")?.toString().trim() || "Other";
  const description = formData.get("description")?.toString().trim() || null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `subscriber-files/tenant-${user.tenantId}`,
          resource_type: getResourceType(file.type),
          access_mode: "public",
          use_filename: true,
          unique_filename: true,
          filename_override: file.name,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      )
      .end(buffer);
  });

  const created = await prisma.uploadedFile.create({
    data: {
      title,
      description,
      category,
      fileName: uploadResult.public_id,
      originalName: file.name,
      url: uploadResult.secure_url,
      mimeType: file.type,
      size: file.size,
      uploadedBy: Number(user.id),
      tenantId: Number(user.tenantId),
    },
  });

  return Response.json(
    new ApiResponse(201, created, "File uploaded successfully"),
    { status: 201 },
  );
});
