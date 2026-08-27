import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "llms.txt");

  try {
    const content = await fs.readFile(filePath, "utf8");

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return new Response("llms.txt is not available", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
