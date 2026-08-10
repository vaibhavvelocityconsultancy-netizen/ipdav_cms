// lib/services/forms/form-upload.service.js
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { ApiError } from "../../utils/ApiError";
// import { ApiError } from "../../utils/ApiError.js";

const UPLOAD_ROOT = process.env.UPLOAD_DIR || "public/uploads";
const FORM_SUBDIR = "form-submissions";
const DEFAULT_MAX_SIZE_MB = 10;

export async function uploadFormFile(file, formSlug, fieldConfig = {}) {
  console.log("uploadFormFile called:", file?.name, formSlug); // 👈 add this

  const maxSizeBytes =
    (fieldConfig.maxSizeMB || DEFAULT_MAX_SIZE_MB) * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    throw new ApiError(
      400,
      `File "${file.name}" exceeds max size of ${fieldConfig.maxSizeMB || DEFAULT_MAX_SIZE_MB}MB`,
    );
  }

  // Validate accepted types if configured
  if (fieldConfig.accept) {
    const accepted = fieldConfig.accept
      .split(",")
      .map((a) => a.trim().toLowerCase());
    const ext = path.extname(file.name).toLowerCase();
    const mime = (file.type || "").toLowerCase();

    const isAllowed = accepted.some((rule) => {
      if (rule === "image/*") return mime.startsWith("image/");
      if (rule.startsWith(".")) return ext === rule;
      return mime === rule;
    });

    if (!isAllowed) {
      throw new ApiError(400, `File type not allowed for "${file.name}"`);
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || "";
  const safeName = `${crypto.randomUUID()}${ext}`;
  const targetDir = path.join(
    process.cwd(),
    UPLOAD_ROOT,
    FORM_SUBDIR,
    formSlug,
  );

  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, safeName), buffer);

  return {
    url: `/uploads/${FORM_SUBDIR}/${formSlug}/${safeName}`, // 👈 served statically, no custom route needed
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
  };
}
