import { PrismaClient } from "@prisma/client";
import { load } from "cheerio";

const prisma = new PrismaClient();

function extractSearchableText(html) {
  const $ = load(html || "");
  $("script, style").remove();
  return $.text().replace(/\s+/g, " ").trim();
}

async function run() {
  const [pages, posts] = await Promise.all([
    prisma.page.findMany({
      where: { searchText: null },
      select: { id: true, html: true },
    }),
    prisma.post.findMany({
      where: { searchText: null },
      select: { id: true, content: true },
    }),
  ]);

  for (const page of pages) {
    await prisma.page.update({
      where: { id: page.id },
      data: { searchText: extractSearchableText(page.html) },
    });
  }
  for (const post of posts) {
    await prisma.post.update({
      where: { id: post.id },
      data: { searchText: extractSearchableText(post.content) },
    });
  }
  await prisma.$disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
