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
        const counter = root.querySelector<HTMLElement>(
          "[data-gallery-current]",
        );

        if (!lightbox || !preview || !caption || !counter) return;

        let index = 0;
        const visible = () => cards.filter((card) => !card.hidden);
        const show = (next: number) => {
          const list = visible();
          if (!list.length) return;
          index = (next + list.length) % list.length;
          const card = list[index];
          const image = card.querySelector<HTMLImageElement>("img");
          if (!image) return;
          preview.src = image.src;
          preview.alt = image.alt;
          caption.textContent =
            card.querySelector<HTMLElement>(".cms-gallery-caption")
              ?.textContent || "";
          counter.textContent = String(index + 1);
          lightbox.hidden = false;
          document.body.style.overflow = "hidden";
        };
        const close = () => {
          lightbox.hidden = true;
          document.body.style.overflow = "";
        };
        const onKeyDown = (event: KeyboardEvent) => {
          if (lightbox.hidden) return;
          if (event.key === "Escape") close();
          if (event.key === "ArrowLeft") show(index - 1);
          if (event.key === "ArrowRight") show(index + 1);
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
            show(visible().indexOf(card)),
          ),
        );
        listen(root.querySelector(".cms-gallery-close"), "click", close);
        listen(root.querySelector(".cms-gallery-prev"), "click", () =>
          show(index - 1),
        );
        listen(root.querySelector(".cms-gallery-next"), "click", () =>
          show(index + 1),
        );
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
