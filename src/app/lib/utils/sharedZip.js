import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const archiver = require("archiver");

export async function buildSharedZipBuffer(files) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const chunks = [];

  const zipPromise = new Promise((resolve, reject) => {
    archive.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    archive.on("end", () => resolve(Buffer.concat(chunks)));
    archive.on("error", reject);
  });

  for (const item of files) {
    const file = item?.file ?? item;
    const fileName = file.originalName || file.title || "downloaded-file";
    const fileUrl = file.url;

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
      const buffer = Buffer.from(await response.arrayBuffer());
      archive.append(buffer, { name: fileName });
      continue;
    }

    const relativePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    const filePath = path.join(process.cwd(), "public", relativePath);
    const fileBuffer = await fs.readFile(filePath);
    archive.append(fileBuffer, { name: fileName });
  }

  archive.finalize();
  return zipPromise;
}
