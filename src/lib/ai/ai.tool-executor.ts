import { getAITool } from "./ai.tools";
import {
  getPageById,
  createPage,
  updatePage,
  deletePage,
  searchPages,
} from "@/src/app/lib/services/pages/page.service";
import { searchContent } from "@/src/app/lib/services/pages/search.service";
import {
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "@/src/app/lib/services/posts/post.service";
import { getAllMedia } from "@/src/app/lib/services/media/media.service";
import {
  getGalleryById,
  createGallery,
  addImagesToGallery,
} from "@/src/app/lib/services/galleries/gallery.service";
import { updateBulkSeo } from "@/src/app/lib/services/seo/bulk-seo.service";

type ToolArguments = Record<string, any>;

type ToolResult =
  | { success: true; tool: string; data: unknown }
  | { success: false; tool: string; error: string };

export async function executeAITool(
  toolName: string,
  arguments_: ToolArguments = {},
): Promise<ToolResult> {
  if (!getAITool(toolName)) {
    return { success: false, tool: toolName, error: "Unknown tool" };
  }

  try {
    let data: unknown;

    switch (toolName) {
      case "get_page":
        data = await getPageById(arguments_.id);
        break;
      case "search_pages":
        data = await searchPages(arguments_.query ?? "");
        break;
      case "create_page":
        data = await createPage(arguments_.input ?? arguments_);
        break;
      case "update_page":
        data = await updatePage(arguments_.id, arguments_.input ?? arguments_);
        break;
      case "delete_page":
        data = await deletePage(arguments_.id);
        break;
      case "get_post":
        data = await getPostById(arguments_.id);
        break;
      case "search_posts":
        data = (await searchContent(arguments_.query, arguments_.tenantId))
          .posts;
        break;
      case "create_post":
        data = await createPost(arguments_.input ?? arguments_);
        break;
      case "update_post":
        data = await updatePost(arguments_.id, arguments_.input ?? arguments_);
        break;
      case "delete_post":
        data = await deletePost(arguments_.id);
        break;
      case "search_media":
        data = await getAllMedia(arguments_);
        break;
      case "get_gallery":
        data = await getGalleryById(arguments_.id, arguments_.tenantId);
        break;
      case "create_gallery":
        data = await createGallery(
          arguments_.input ?? arguments_,
          arguments_.tenantId,
        );
        break;
      case "add_gallery_images":
        data = await addImagesToGallery(
          arguments_.id,
          arguments_.mediaIds ?? [],
          arguments_.tenantId,
        );
        break;
      case "update_seo":
        data = await updateBulkSeo(arguments_.items ?? []);
        break;
      case "analyze_seo":
        return {
          success: false,
          tool: toolName,
          error: "Tool not implemented yet",
        };
      default:
        return {
          success: false,
          tool: toolName,
          error: "Tool not implemented yet",
        };
    }

    return { success: true, tool: toolName, data };
  } catch (error) {
    return {
      success: false,
      tool: toolName,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
