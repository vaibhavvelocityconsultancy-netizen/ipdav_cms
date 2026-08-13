import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { ZipArchive } = require("archiver");

export async function buildSharedZipBuffer(files) {
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const chunks = [];
  let addedFiles = 0;

  const zipPromise = new Promise((resolve, reject) => {
    archive.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });

  for (const item of files) {
    const file = item?.file ?? item;
    const fileName = file.originalName || file.title || "downloaded-file";
    const fileUrl = file?.url;

    try {
      let buffer;

      if (!fileUrl) {
        throw new Error(`Missing file URL for ${fileName}`);
      }

      if (/^https?:\/\//i.test(fileUrl)) {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch remote file ${fileName}: ${response.status} ${response.statusText}`,
          );
        }
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        const relativePath = fileUrl.startsWith("/")
          ? fileUrl.slice(1)
          : fileUrl;
        const filePath = path.join(process.cwd(), "public", relativePath);
        buffer = await fs.readFile(filePath);
      }

      archive.append(buffer, { name: fileName });
      addedFiles += 1;
    } catch (error) {
      console.error(`Skipping file in shared zip: ${fileName}`, error);
    }
  }

  if (addedFiles === 0) {
    throw new Error("No valid files were available to include in the zip");
  }

  archive.finalize();
  return zipPromise;
}
