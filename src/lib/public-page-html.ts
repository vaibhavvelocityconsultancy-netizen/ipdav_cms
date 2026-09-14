import { injectBreadcrumb } from "./shortcode/renderBreadcrumbHtml";
import { injectForms } from "./form-renderer";
import { renderGalleryShortcodes } from "./shortcode/renderGalleryHtml";

interface PublicPageHtmlOptions {
  breadcrumbItems?: Array<{ label: string; href: string }>;
  breadcrumbSettings?: any;
  baseUrl?: string;

  context?: {
    isHome?: boolean;
    is404?: boolean;
    isSearch?: boolean;
  };
}

export async function processPublicPageHtml(
  html: string,
  options: PublicPageHtmlOptions = {},
): Promise<{
  html: string;
  hasForms: boolean;
}> {
  // ── Forms ─────────────────────────────────────────────
  const { html: formsHtml, hasForms } = await injectForms(
    html,
    options.baseUrl ?? "",
  );
  const galleryHtml = await renderGalleryShortcodes(formsHtml);

  // ── Breadcrumb ────────────────────────────────────────
  const breadcrumbItems = options.breadcrumbItems ?? [];
  const breadcrumbSettings = options.breadcrumbSettings;

  const context = {
    isHome: options.context?.isHome ?? false,
    is404: options.context?.is404 ?? false,
    isSearch: options.context?.isSearch ?? false,
  };

  const htmlWithBreadcrumb = breadcrumbItems.length
    ? injectBreadcrumb(galleryHtml, breadcrumbItems, breadcrumbSettings, context)
    : galleryHtml;

  return {
    html: htmlWithBreadcrumb,
    hasForms,
  };
}
