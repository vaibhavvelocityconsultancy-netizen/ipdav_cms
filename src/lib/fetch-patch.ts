// src/lib/fetch-patch.ts
// Patches the global fetch so any relative "/api/..." call automatically
// gets prefixed with the app's basePath (e.g. "/newweb") when running
// in the browser. This avoids having to rewrite every fetch("/api/...")
// call across the codebase when deployed under a subpath.

if (typeof window !== "undefined") {
  const originalFetch = window.fetch;

  const getBasePath = () => {
    try {
      const url = new URL(
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      );
      return url.pathname.replace(/\/$/, "");
    } catch {
      return "";
    }
  };

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const basePath = getBasePath();

    if (
      basePath &&
      typeof input === "string" &&
      input.startsWith("/api")
    ) {
      input = `${basePath}${input}`;
    }

    return originalFetch(input, init);
  }) as typeof window.fetch;
}