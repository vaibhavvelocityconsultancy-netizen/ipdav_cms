import type { AIToolDefinition } from "./ai.types";

export const aiTools: AIToolDefinition[] = [
  { name: "get_page", description: "Read a page", permission: "pages_view", risk: "READ" },
  { name: "search_pages", description: "Find pages", permission: "pages_view", risk: "READ" },
  { name: "create_page", description: "Create a draft page", permission: "pages_create", risk: "MEDIUM" },
  { name: "update_page", description: "Update a page", permission: "pages_edit", risk: "MEDIUM" },
  { name: "get_post", description: "Read a post", permission: "posts_view", risk: "READ" },
  { name: "search_posts", description: "Find posts", permission: "posts_view", risk: "READ" },
  { name: "create_post", description: "Create a draft post", permission: "posts_create", risk: "MEDIUM" },
  { name: "update_post", description: "Update a post", permission: "posts_edit", risk: "MEDIUM" },
  { name: "search_media", description: "Find media", permission: "media_upload", risk: "READ" },
  { name: "get_gallery", description: "Read a gallery", permission: "settings_manage", risk: "READ" },
  { name: "create_gallery", description: "Create a gallery", permission: "settings_manage", risk: "MEDIUM" },
  { name: "add_gallery_images", description: "Add images to a gallery", permission: "settings_manage", risk: "MEDIUM" },
  { name: "analyze_seo", description: "Analyze SEO metadata", permission: "seo_view", risk: "READ" },
  { name: "update_seo", description: "Update SEO metadata", permission: "seo_manage", risk: "MEDIUM" },
  { name: "delete_page", description: "Delete a page", permission: "pages_delete", risk: "HIGH" },
  { name: "delete_post", description: "Delete a post", permission: "posts_delete", risk: "HIGH" },
];

export function getAITool(name: string) {
  return aiTools.find((tool) => tool.name === name);
}
