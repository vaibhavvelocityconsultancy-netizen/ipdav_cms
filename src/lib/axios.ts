import axios from "axios";

function getApiBaseUrl() {
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
    const pathname = window.location.pathname.replace(/\/$/, "");
    if (!pathname || pathname === "/") return "";

    const knownBasePaths = ["/newweb", "/cms", "/app"];
    const matchedBasePath = knownBasePaths.find(
      (basePath) =>
        pathname === basePath || pathname.startsWith(`${basePath}/`),
    );

    return matchedBasePath ?? "";
  }

  return "";
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;

    const enhancedError = new Error(
      payload?.message || payload?.error || error.message || "Request failed",
    ) as any;

    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    enhancedError.data = payload;

    return Promise.reject(enhancedError);
  },
);

// Export helper for fetch() if needed
export { getApiBaseUrl };
