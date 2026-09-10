import { prisma } from "../../prisma";

export async function searchPublishedContent(query, tenantId) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();
  const where = {
    tenantId,
    status: "PUBLISHED",
    OR: [{ title: { contains: q } }, { searchText: { contains: q } }],
  };
  const [pages, posts] = await Promise.all([
    prisma.page.findMany({
      where,
      select: { id: true, title: true, slug: true, searchText: true },
      take: 10,
    }),
    prisma.post.findMany({
      where,
      select: { id: true, title: true, slug: true, searchText: true },
      take: 10,
    }),
  ]);
  const buildExcerpt = (text) =>
    text ? `${text.slice(0, 120)}${text.length > 120 ? "..." : ""}` : "";
  return [
    ...pages.map((item) => ({
      ...item,
      type: "page",
      excerpt: buildExcerpt(item.searchText),
    })),
    ...posts.map((item) => ({
      ...item,
      type: "post",
      excerpt: buildExcerpt(item.searchText),
    })),
  ];
}
