import axios from "axios";

function getApiBaseUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!siteUrl) return "";

  try {
    const url = new URL(siteUrl);

    // Example:
    // http://localhost:3000        -> ""
    // https://ipdav.com/newweb     -> "/newweb"
    // https://client.com/cms       -> "/cms"
    return url.pathname.replace(/\/$/, "");
  } catch {
    return "";
  }
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
      payload?.message ||
      payload?.error ||
      error.message ||
      "Request failed"
    ) as any;

    enhancedError.status = error.response?.status;
    enhancedError.response = error.response;
    enhancedError.data = payload;

    return Promise.reject(enhancedError);
  }
);

// Export helper for fetch() if needed
export { getApiBaseUrl };