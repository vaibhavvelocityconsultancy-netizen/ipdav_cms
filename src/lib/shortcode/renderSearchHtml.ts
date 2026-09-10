export function injectSearch(html: string): {
  html: string;
  hasSearch: boolean;
} {
  let hasSearch = false;
  let searchIndex = 0;

  const processedHtml = html.replace(
    /\[search(?:\s+([^\]]*))?\]/gi,
    (_match, attributes = "") => {
      hasSearch = true;
      searchIndex += 1;

      const placeholder =
        attributes.match(/placeholder=["']([^"']*)["']/i)?.[1] ?? "Search...";
      const buttonText =
        attributes.match(/button=["']([^"']*)["']/i)?.[1] ?? "Search";
      const customClass =
        attributes.match(/class=["']([^"']*)["']/i)?.[1] ?? "";
      const escapeHtml = (value: string) =>
        value.replace(/[&<>"']/g, (character) => {
          const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          };
          return entities[character];
        });
      const inputId = `cms-search-input-${searchIndex}`;

      return `
        <div class="cms-search ${escapeHtml(customClass)}" data-cms-search>
          <form class="cms-search-form" role="search">
            <div class="cms-search-input-wrapper">
              <label class="cms-search-label" for="${inputId}">Search</label>
              <input id="${inputId}" type="search" class="cms-search-input" placeholder="${escapeHtml(placeholder)}" autocomplete="off" />
              <button type="submit" class="cms-search-button">${escapeHtml(buttonText)}</button>
            </div>
            <div class="cms-search-results" aria-live="polite"></div>
          </form>
        </div>
      `;
    },
  );

  return { html: processedHtml, hasSearch };
}
