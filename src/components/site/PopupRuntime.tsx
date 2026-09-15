"use client";

import { useEffect, useState } from "react";

type Popup = {
  id: number;
  type: "MODAL" | "BAR" | "ELEMENT";
  trigger: "PAGE_LOAD" | "DELAY" | "ELEMENT_CLICK";
  delayMs: number;
  frequency:
    "EVERY_TIME" | "ONCE_SESSION" | "ONCE_DAY" | "ONCE_VISITOR" | "ONCE_WEEK";
  html: string;
  css?: string | null;
  elementClass?: string | null;
};

function canShow(popup: Popup) {
  if (popup.frequency === "EVERY_TIME") return true;
  const key = `popup-${popup.id}`;
  const storage =
    popup.frequency === "ONCE_SESSION" ? sessionStorage : localStorage;
  const stored = storage.getItem(key);
  if (!stored) return true;
  if (popup.frequency === "ONCE_SESSION") return false;
  if (popup.frequency === "ONCE_VISITOR") return false;
  const elapsed = Date.now() - Number(stored);
  const duration = popup.frequency === "ONCE_DAY" ? 86400000 : 604800000;
  return elapsed > duration;
}

export default function PopupRuntime() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [active, setActive] = useState<Popup | null>(null);

  useEffect(() => {
    fetch(`/api/public/popups?page=${encodeURIComponent(location.pathname)}`)
      .then((response) => response.json())
      .then((payload) => setPopups(payload.data || []))
      .catch(() => setPopups([]));
  }, []);

  useEffect(() => {
    const listeners: Array<() => void> = [];
    popups.forEach((popup) => {
      if (!canShow(popup)) return;
      if (popup.type === "ELEMENT" && popup.elementClass) {
        const handler = () => setActive(popup);
        document
          .querySelectorAll(`.${popup.elementClass}`)
          .forEach((element) => element.addEventListener("click", handler));
        listeners.push(() =>
          document
            .querySelectorAll(`.${popup.elementClass}`)
            .forEach((element) =>
              element.removeEventListener("click", handler),
            ),
        );
      }
      if (
        popup.type !== "ELEMENT" &&
        (popup.trigger === "PAGE_LOAD" || popup.trigger === "DELAY")
      ) {
        const timer = window.setTimeout(
          () => setActive(popup),
          popup.trigger === "DELAY" ? popup.delayMs : 0,
        );
        listeners.push(() => window.clearTimeout(timer));
      }
    });
    return () => listeners.forEach((cleanup) => cleanup());
  }, [popups]);

  if (!active) return null;
  const close = () => {
    const storage =
      active.frequency === "ONCE_SESSION" ? sessionStorage : localStorage;
    if (active.frequency !== "EVERY_TIME")
      storage.setItem(`popup-${active.id}`, String(Date.now()));
    setActive(null);
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: popups.map((popup) => popup.css || "").join("\n"),
        }}
      />
      <div
        className={`fixed inset-0 z-50 flex ${active.type === "BAR" ? "items-end" : "items-center"} justify-center bg-black/50 p-4`}
        onClick={close}
      >
        <div
          className={`relative ${active.elementClass || "popup-content"} max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl bg-background p-6 shadow-2xl ${active.type === "BAR" ? "max-w-none rounded-b-none" : ""}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close popup"
            onClick={close}
            className="absolute right-4 top-3 text-2xl text-muted-foreground"
          >
            ×
          </button>
          <div dangerouslySetInnerHTML={{ __html: active.html }} />
        </div>
      </div>
    </>
  );
}
