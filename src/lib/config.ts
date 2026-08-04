// src/lib/config.ts

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function getBaseUrl() {
  // Server
  if (typeof window === "undefined") {
    return SITE_URL.replace(/\/$/, "");
  }

  // Client
  try {
    const url = new URL(SITE_URL);
    return url.pathname.replace(/\/$/, "");
  } catch {
    return "";
  }
}