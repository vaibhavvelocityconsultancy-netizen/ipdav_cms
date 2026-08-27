import fs from "fs";
import path from "path";
import { resolveSeoTemplate } from "../../../../lib/seo-template";

function normalizeBaseUrl(baseUrl) {
  return (
    baseUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://example.com"
  ).replace(/\/$/, "");
}

function buildContentUrl(baseUrl, slug, type = "page") {
  const safeBaseUrl = normalizeBaseUrl(baseUrl);

  if (type === "post") {
    if (!slug) return `${safeBaseUrl}/blog`;
    return `${safeBaseUrl}/blog/${slug.replace(/^\/+|\/+$/g, "")}`;
  }

  if (!slug || slug === "home" || slug === "/") {
    return `${safeBaseUrl}/`;
  }

  return `${safeBaseUrl}/${slug.replace(/^\/+|\/+$/g, "")}`;
}

export function generateLlmsTxtContent(baseUrl, pages, posts, siteSettings) {
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl);

  let content = `# AI & LLM Content Index

**Generated:** ${new Date().toISOString()}
**Site:** ${resolvedBaseUrl}

---

## Pages (${pages.length})

`;

  if (pages.length > 0) {
    pages.forEach((page) => {
      const date = new Date(page.updatedAt).toISOString().split("T")[0];
      const url = buildContentUrl(resolvedBaseUrl, page.slug, "page");
      const rawMetaTitle =
        page.seoData && typeof page.seoData === "object"
          ? page.seoData.metaTitle || ""
          : "";
      const metaTitle = resolveSeoTemplate(rawMetaTitle, {
        title: page.title,
        page: page.title,
        separator: page.seoData?.separator || siteSettings?.separator || "|",
        siteName: siteSettings?.siteName,
      });
      const metaDescription =
        page.seoData && typeof page.seoData === "object"
          ? page.seoData.metaDescription || ""
          : "";
      content += `- [${page.title}](${url}): Updated ${date}\n`;
      content += `  Title: ${page.title}\n`;
      if (metaTitle) content += `  Meta Title: ${metaTitle}\n`;
      if (metaDescription)
        content += `  Meta Description: ${metaDescription}\n`;
      content += "\n";
    });
  } else {
    content += `(No pages)\n\n`;
  }

  content += `---\n\n## Posts (${posts.length})\n\n`;

  if (posts.length > 0) {
    posts.forEach((post) => {
      const updatedAt = post.updatedAt || post.publishedAt || new Date();
      const date = new Date(updatedAt).toISOString().split("T")[0];
      const url = buildContentUrl(resolvedBaseUrl, post.slug, "post");
      const rawMetaTitle =
        post.seoData && typeof post.seoData === "object"
          ? post.seoData.metaTitle || ""
          : "";
      const metaTitle = resolveSeoTemplate(rawMetaTitle, {
        title: post.title,
        page: post.title,
        separator: post.seoData?.separator || siteSettings?.separator || "|",
        siteName: siteSettings?.siteName,
      });
      const metaDescription =
        post.seoData && typeof post.seoData === "object"
          ? post.seoData.metaDescription || ""
          : "";
      content += `- [${post.title}](${url}): Updated ${date}\n`;
      content += `  Title: ${post.title}\n`;
      if (metaTitle) content += `  Meta Title: ${metaTitle}\n`;
      if (metaDescription)
        content += `  Meta Description: ${metaDescription}\n`;
      content += "\n";
    });
  } else {
    content += `(No posts)\n\n`;
  }

  content += `---\n\n## Summary\n\n`;
  content += `- Total Pages: ${pages.length}\n`;
  content += `- Total Posts: ${posts.length}\n`;
  content += `- Total Items: ${pages.length + posts.length}\n`;
  content += `- Site: ${resolvedBaseUrl}\n`;

  return content;
}

export function writeLlmsTxtFile(content) {
  const filePath = path.join(process.cwd(), "data", "llms.txt");
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}
