import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { generateLlmsTxtContent } from "../lib/services/seo/llmsTxtContent";

export const dynamic = "force-dynamic";

async function generateContent() {
  const tenant = await prisma.tenant.findFirst({ select: { id: true } });
  if (!tenant) throw new Error("No tenant found");

  const settings = await prisma.AICrawlSettings.findUnique({
    where: { tenantId: tenant.id },
  });
  const includePages = settings?.includePages ?? true;
  const includePosts = settings?.includePosts ?? true;
  const excludeDrafts = settings?.excludeDrafts ?? true;

  const pages = includePages
    ? await prisma.page.findMany({
        where: {
          tenantId: tenant.id,
          ...(excludeDrafts ? { status: "PUBLISHED" } : {}),
        },
        select: { title: true, slug: true, seoData: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      })
    : [];
  const posts = includePosts
    ? await prisma.post.findMany({
        where: {
          tenantId: tenant.id,
          ...(excludeDrafts ? { status: "PUBLISHED" } : {}),
        },
        select: { title: true, slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
      })
    : [];

  return generateLlmsTxtContent(
    process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
    pages,
    posts,
  );
}

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "llms.txt");

  try {
    let content;
    try {
      content = await fs.readFile(filePath, "utf8");
    } catch {
      content = await generateContent();
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, "utf8");
    }

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to load llms.txt:", error);
    return new Response("llms.txt is not available", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
