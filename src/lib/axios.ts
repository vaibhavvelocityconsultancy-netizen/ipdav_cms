import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
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
