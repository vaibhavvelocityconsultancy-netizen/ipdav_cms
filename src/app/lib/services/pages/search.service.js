// import { prisma } from "../../prisma.js";

import { prisma } from "../../prisma";

/**
 * Search published pages and posts for the current tenant.
 *
 * @param {string} query
 * @param {number} tenantId
 */
export async function searchContent(query, tenantId) {
  const search = String(query || "").trim();

  if (!search) {
    return {
      pages: [],
      posts: [],
      total: 0,
    };
  }

  const [pages, posts] = await Promise.all([
    prisma.page.findMany({
      where: {
        tenantId,
        status: "PUBLISHED",
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            searchText: {
              contains: search,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        searchText: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.post.findMany({
      where: {
        tenantId,
        status: "PUBLISHED",
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            searchText: {
              contains: search,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        searchText: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    pages,
    posts,
    total: pages.length + posts.length,
  };
}