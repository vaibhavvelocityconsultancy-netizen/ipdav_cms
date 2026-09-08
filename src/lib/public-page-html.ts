import { injectBreadcrumb } from "./shortcode/renderBreadcrumbHtml";
import { injectSearch } from "./shortcode/renderSearchHtml";
import { injectForms } from "./form-renderer";

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
  hasSearch: boolean;
}> {
  // ── Forms ─────────────────────────────────────────────
  const { html: formsHtml, hasForms } = await injectForms(
    html,
    options.baseUrl ?? "",
  );

  // ── Search ────────────────────────────────────────────
  const {
    html: searchHtml,
    hasSearch,
  } = injectSearch(formsHtml);

  // ── Breadcrumb ────────────────────────────────────────
  const breadcrumbItems = options.breadcrumbItems ?? [];
  const breadcrumbSettings = options.breadcrumbSettings;

  const context = options.context ?? {
    isHome: false,
    is404: false,
    isSearch: false,
  };

  const htmlWithBreadcrumb = breadcrumbItems.length
    ? injectBreadcrumb(
        searchHtml,
        breadcrumbItems,
        breadcrumbSettings,
        context,
      )
    : searchHtml;

  return {
    html: htmlWithBreadcrumb,
    hasForms,
    hasSearch,
  };
}