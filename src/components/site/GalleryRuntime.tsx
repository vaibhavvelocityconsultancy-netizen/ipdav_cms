"use client";

import { useEffect } from "react";

export default function GalleryRuntime() {
  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    const mountGalleries = () =>
      document.querySelectorAll<HTMLElement>(".cms-gallery").forEach((root) => {
        if (root.dataset.ready === "1") return;
        root.dataset.ready = "1";

        const cards = Array.from(
          root.querySelectorAll<HTMLElement>(".cms-gallery-item"),
        );
        const lightbox = root.querySelector<HTMLElement>(
          ".cms-gallery-lightbox",
        );
        const preview = root.querySelector<HTMLImageElement>(
          ".cms-gallery-lightbox-image",
        );
        const caption = root.querySelector<HTMLElement>(
          ".cms-gallery-lightbox-caption",
        );
        let previouslyFocused: HTMLElement | null = null;

        if (!lightbox || !preview || !caption) return;

        const show = (card: HTMLElement) => {
          const image = card.querySelector<HTMLImageElement>("img");
          if (!image) return;
          previouslyFocused = document.activeElement as HTMLElement | null;
          preview.src = image.src;
          preview.alt = image.alt;
          caption.textContent =
            card.querySelector<HTMLElement>(".cms-gallery-caption")
              ?.textContent || "";
          lightbox.hidden = false;
          document.body.style.overflow = "hidden";
          root.querySelector<HTMLButtonElement>(".cms-gallery-close")?.focus();
        };
        const close = () => {
          lightbox.hidden = true;
          document.body.style.overflow = "";
          previouslyFocused?.focus();
          previouslyFocused = null;
        };
        const onKeyDown = (event: KeyboardEvent) => {
          if (lightbox.hidden) return;
          if (event.key === "Escape") close();
        };

        const handlers: Array<[Element, string, EventListener]> = [];
        const listen = (
          element: Element | null,
          type: string,
          handler: EventListener,
        ) => {
          if (!element) return;
          element.addEventListener(type, handler);
          handlers.push([element, type, handler]);
        };

        cards.forEach((card) =>
          listen(card.querySelector(".cms-gallery-frame"), "click", () =>
            show(card),
          ),
        );
        listen(root.querySelector(".cms-gallery-close"), "click", close);
        listen(lightbox, "click", (event) => {
          if (event.target === lightbox) close();
        });
        root
          .querySelectorAll<HTMLElement>(".cms-gallery-filter")
          .forEach((filter) =>
            listen(filter, "click", () => {
              root
                .querySelectorAll(".cms-gallery-filter")
                .forEach((item) => item.classList.remove("is-active"));
              filter.classList.add("is-active");
              const category = filter.dataset.galleryFilter;
              cards.forEach(
                (card) =>
                  (card.hidden =
                    category !== "all" && card.dataset.category !== category),
              );
            }),
          );
        document.addEventListener("keydown", onKeyDown);

        cleanupFunctions.push(() => {
          handlers.forEach(([element, type, handler]) =>
            element.removeEventListener(type, handler),
          );
          document.removeEventListener("keydown", onKeyDown);
          if (!lightbox.hidden) document.body.style.overflow = "";
        });
      });

    mountGalleries();
    const observer = new MutationObserver(mountGalleries);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  });

  return null;
}
