// src/lib/fetch-patch.ts
// Patches the global fetch so any relative "/api/..." call automatically
// gets prefixed with the app's basePath (e.g. "/newweb") when running
// in the browser or current runtime. This avoids having to rewrite every
// fetch("/api/...") call across the codebase when deployed under a subpath.

if (
  typeof globalThis.fetch === "function" &&
  !(globalThis as any).__ipdavFetchPatched
) {
  const originalFetch = globalThis.fetch;

  const getBasePath = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (siteUrl) {
      try {
        const url = new URL(siteUrl);
        return url.pathname.replace(/\/$/, "");
      } catch {
        return "";
      }
    }

    if (typeof window !== "undefined") {
      try {
        return new URL(window.location.origin).pathname.replace(/\/$/, "");
      } catch {
        return "";
      }
    }

    return "";
  };

  const patchedFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const basePath = getBasePath();

    if (basePath && typeof input === "string" && input.startsWith("/api")) {
      const alreadyPrefixed = input.startsWith(`${basePath}/api`);
      if (!alreadyPrefixed) {
        input = `${basePath}${input}`;
      }
    }

    return originalFetch(input, init);
  }) as typeof globalThis.fetch;

  (globalThis as any).__ipdavFetchPatched = true;
  globalThis.fetch = patchedFetch;
}
