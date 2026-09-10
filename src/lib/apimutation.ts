// src/lib/apiMutations.ts

import { getBaseUrl } from "./config";

// src/lib/apiMutations.ts

export async function mutationRequest(url: string, method: string, body?: any) {
  const isFormData = body instanceof FormData;
  const fullUrl = url.startsWith("http") ? url : `${getBaseUrl()}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const text = await res.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    console.error("Non-JSON response:", {
      url: fullUrl,
      status: res.status,
      text,
    });
    throw new Error(`Server returned HTML (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const apiMutations = {
  create: (data: any) => mutationRequest("/api/courses", "POST", data),

  update: (data: any, id: string) =>
    mutationRequest(`/api/courses/${id}`, "PUT", data),

  delete: (id: string) => mutationRequest(`/api/courses/${id}`, "DELETE"),

  toggleStatus: (id: string) =>
    mutationRequest(`/api/courses/${id}/toggle-published`, "PATCH"),

  reorder: (courses: any[]) =>
    mutationRequest("/api/courses/reorder", "PUT", courses),

  createContent: (data: any) =>
    mutationRequest("/api/course-content", "POST", data),

  updateContent: (data: any, id: string) =>
    mutationRequest(`/api/course-content/${id}`, "PATCH", data),

  deleteContent: (id: string) =>
    mutationRequest(`/api/course-content/${id}`, "DELETE"),

  updateModules: (id: string, modules: any[]) =>
    mutationRequest(`/api/course-content/${id}/modules`, "PATCH", { modules }),

  togglePublish: (id: string) =>
    mutationRequest(`/api/course-content/${id}/publish`, "PATCH"),

  // createCoursePrice: async (data: any) => {
  //   const res = await fetch("/api/pricing", {
  //     // adjust to your actual pricing endpoint
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(data), // includes courseContentId now
  //   });
  //   if (!res.ok) throw new Error("Failed to create pricing card");
  //   return res.json();
  // },

  updateSettings: (data: any) => mutationRequest("/api/setting", "PATCH", data),

  updateAdminToolbar: (data: any) =>
    mutationRequest("/api/setting/admin-toolbar", "PATCH", data),

  updateGlobalCss: (css: string) =>
    mutationRequest("/api/setting/global-css", "PUT", { css }),

  updateGlobalJs: (js: string) =>
    mutationRequest("/api/setting/global-js", "PUT", { js }),

  updateNavbarConfig: (data: any) =>
    mutationRequest("/api/navbar-config", "PUT", data),
  resetNavbarConfig: () => mutationRequest("/api/navbar-config", "DELETE"),
  toggleCourseStatus: (id: string, data: { isPublished: boolean }) =>
    mutationRequest(`/api/courses/${id}/toggle-status`, "PATCH", data),

  createProduct: (data: any) =>
    mutationRequest("/api/ecommerce/products", "POST", data),
  updateProduct: (id: string, data: any) =>
    mutationRequest(`/api/ecommerce/products/${id}`, "PATCH", data),

  // Content taxonomy
  createCategory: (data: any) =>
    mutationRequest("/api/categories", "POST", data),
  createTag: (data: any) => mutationRequest("/api/tags", "POST", data),

  // customers
  deleteOrder: (orderId: string) =>
    mutationRequest(`/api/admin/orders/${orderId}`, "DELETE"),
  deleteEnrollment: (enrollmentId: string) =>
    mutationRequest(`/api/admin/enrollments/${enrollmentId}`, "DELETE"),

  // file categories
  createFileCategory: (data: any) =>
    mutationRequest("/api/file-category", "POST", data),
  updateFileCategory: (id: string, data: any) =>
    mutationRequest(`/api/file-category/${id}`, "PUT", data),
  deleteFileCategory: (id: string) =>
    mutationRequest(`/api/file-category/${id}`, "DELETE"),
  updateFile: (id: string, data: any) =>
    mutationRequest(`/api/files/${id}`, "PUT", data),

  // delete upload file
  deleteFile: (id: String) => mutationRequest(`/api/files/${id}`, "DELETE"),
};
