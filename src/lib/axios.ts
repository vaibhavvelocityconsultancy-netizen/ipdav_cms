import axios from "axios";

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    try {
      const url = new URL(
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin,
      );
      return url.pathname.replace(/\/$/, "");
    } catch {
      return "";
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SITE_URL);
      return url.pathname.replace(/\/$/, "");
    } catch {
      return "";
    }
  }

  return "";
}

export const api = axios.create({
  baseURL: getApiBaseUrl() || undefined,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - will handle later");
    }

    const payload = error.response?.data;
    const message =
      payload?.message || payload?.error || error.message || "Request failed";

    console.error(payload || error.message);

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    enhancedError.data = payload;

    return Promise.reject(enhancedError);
  },
);
