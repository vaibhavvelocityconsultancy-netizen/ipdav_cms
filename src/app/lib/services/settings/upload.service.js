import { requirePermission } from "../../withPermission";
import cloudinary from "@/src/lib/cloudinary";

export async function uploadFile(file) {
  const { session } = await requirePermission("media_upload");
  const tenantId = session.user.tenantId;

  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `cms-media/tenant-${tenantId}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}
