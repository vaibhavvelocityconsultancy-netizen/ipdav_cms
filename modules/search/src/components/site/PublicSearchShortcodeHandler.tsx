"use client";

import { useEffect } from "react";
import { getApiBaseUrl } from "@/src/lib/axios";
import { appUrl } from "@/src/lib/base-path";

type SearchItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  searchText?: string | null;
  type: "page" | "post";
};

const SEARCH_CSS = `
  .cms-search-input-wrapper { display:flex; gap:.5rem; }
  .cms-search-label { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .cms-search-input { min-width:0; flex:1; padding:.65rem .8rem; border:1px solid #cbd5e1; border-radius:.375rem; }
  .cms-search-button { padding:.65rem 1rem; border-radius:.375rem; background:#152539; color:#fff; }
  .cms-search-results { margin-top:1rem; }
  .cms-search-result { display:block; padding:.75rem 0; border-bottom:1px solid #e5e7eb; color:inherit; }
  .cms-search-result:hover { text-decoration:underline; }
  .cms-search-result-type { display:block; margin-bottom:.2rem; font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; color:#6b7280; }
  .cms-search-result-excerpt, .cms-search-status { margin:.3rem 0 0; color:#6b7280; }
`;

function getSearchItems(payload: any): SearchItem[] {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  return [
    ...(Array.isArray(data?.pages) ? data.pages : []).map((item: any) => ({
      ...item,
      type: "page" as const,
    })),
    ...(Array.isArray(data?.posts) ? data.posts : []).map((item: any) => ({
      ...item,
      type: "post" as const,
    })),
  ];
}

function renderStatus(results: HTMLElement, message: string) {
  results.replaceChildren();
  const status = document.createElement("p");
  status.className = "cms-search-status";
  status.textContent = message;
  results.append(status);
}

function renderResults(results: HTMLElement, items: SearchItem[]) {
  results.replaceChildren();
  if (!items.length) {
    renderStatus(results, "No results found.");
    return;
  }
  const list = document.createElement("div");
  list.className = "cms-search-results-list";
  items.forEach((item) => {
    const link = document.createElement("a");
    link.className = "cms-search-result";
    link.href = appUrl(
      item.type === "post" ? `/posts/${item.slug}` : `/${item.slug}`,
    );
    const type = document.createElement("span");
    type.className = "cms-search-result-type";
    type.textContent = item.type;
    link.append(type);
    const title = document.createElement("strong");
    title.textContent = item.title;
    link.append(title);
    const summary = (item.excerpt || item.searchText || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
    if (summary) {
      const excerpt = document.createElement("p");
      excerpt.className = "cms-search-result-excerpt";
      excerpt.textContent = summary;
      link.append(excerpt);
    }
    list.append(link);
  });
  results.append(list);
}

export default function PublicSearchShortcodeHandler() {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "cms-search-shortcode-css";
    style.textContent = SEARCH_CSS;
    document.head.append(style);

    const onSubmit = async (event: SubmitEvent) => {
      const form = (event.target as Element | null)?.closest<HTMLFormElement>(
        "form.cms-search-form",
      );
      if (!form) return;
      event.preventDefault();
      const input = form.querySelector<HTMLInputElement>(".cms-search-input");
      const results = form.querySelector<HTMLElement>(".cms-search-results");
      const button =
        form.querySelector<HTMLButtonElement>(".cms-search-button");
      const query = input?.value.trim() ?? "";
      if (!results) return;
      if (!query) {
        renderStatus(results, "Enter a search term.");
        input?.focus();
        return;
      }
      button && (button.disabled = true);
      renderStatus(results, "Searching...");
      try {
        const response = await fetch(
          `${getApiBaseUrl()}/api/search?q=${encodeURIComponent(query)}`,
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) throw new Error();
        renderResults(results, getSearchItems(payload));
      } catch {
        renderStatus(results, "Unable to search right now. Please try again.");
      } finally {
        button && (button.disabled = false);
      }
    };

    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("submit", onSubmit);
      style.remove();
    };
  }, []);

  return null;
}
