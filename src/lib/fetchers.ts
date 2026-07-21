// src/lib/fetchers.ts

function getBaseUrl() {
  // Server-side: MUST use absolute URL for Node.js fetch()
  if (typeof window === "undefined") {
    return (
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000"
    );
  }
  // Client-side: relative URL works fine
  return "";
}

const fetcher = async (url: string) => {
  const fullUrl = url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
  const res = await fetch(fullUrl, {
    cache: "no-store",
  });

  if (!res.ok) {
    // Log the actual status and response body for debugging
    const text = await res.text();
    // console.error(`[Fetcher] ${res.status} ${fullUrl}\n`, text);
    throw new Error(`Failed to fetch ${fullUrl}: ${res.status}`);
  }

  return res.json();
};

export const fetchers = {
  settings: () => fetcher("/api/setting"),
  globalCss: () => fetcher("/api/setting/global-css"),
  globalJs: () => fetcher("/api/setting/global-js"),
  footerSettings: () => fetcher("/api/footer-setting"),
  menus: () => fetcher("/api/menus"),
  page: (slug: string) => fetcher(`/api/pages/slug/${slug}`),
  pageById: (id: string | number) => fetcher(`/api/public/pages/${id}`),
  post: (slug: string) => fetcher(`/api/posts/slug/${slug}`),
  postComments: (postId: string) => fetcher(`/api/posts/${postId}/comments`),
  posts: () => fetcher("/api/posts"),
  publicSettings: () => fetcher("/api/public/settings"),
  publicFooterSettings: () => fetcher("/api/public/footer-settings"),
  publicMenus: () => fetcher("/api/public/menus"),
  publicPageBySlug: (slug: string) => fetcher(`/api/public/pages/slug/${slug}`),
  publicPosts: () => fetcher("/api/public/posts"),
  publicBootstrap: () => fetcher("/api/public/bootstrap"),
  footerMenus: () =>
    fetcher("/api/menus").then((d) => ({
      ...d,
      data: (d.data ?? []).filter((m: any) => m.location === "footer"),
    })),
  courses: () => fetcher("/api/courses"),
  course: (id: string | number) => fetcher(`/api/courses/${id}`),
  publicCourses: () => fetcher("/api/courses/public"),
  publicCourse: (slug: string) => fetcher(`/api/courses/slug/${slug}`),
  getCourseContents: () => fetcher("/api/course-content"),
  getCoursecontentByID: (id: string | number) =>
    fetcher(`/api/course-content/${id}`),
  courseDetail: (id: string) => fetcher(`/api/courses/${id}/detail`),
  availableCourseContent: () =>
    fetcher("/api/course-content?withoutPricing=true"),
  getDashboardData: () => fetcher("/api/subscriber-dashbaord"),
  getMycourses: () => fetcher("/api/enrollments/my"),
  getNavbarConfig: () => fetcher("/api/navbar-config"),

  // ── E-commerce ─────────────────────────────────────────────
  products: (params?: {
    search?: string;
    status?: string;
    brandId?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.status) qs.set("status", params.status);
    if (params?.brandId) qs.set("brandId", params.brandId);
    if (params?.categoryId) qs.set("categoryId", params.categoryId);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return fetcher(`/api/ecommerce/products${query ? `?${query}` : ""}`);
  },
  product: (id: string) => fetcher(`/api/ecommerce/products/${id}`),
  brands: () => fetcher("/api/ecommerce/brands"),
  brand: (id: string) => fetcher(`/api/ecommerce/brands/${id}`),
  productCategories: () => fetcher("/api/ecommerce/product-categories"),
  productCategory: (id: string) =>
    fetcher(`/api/ecommerce/product-categories/${id}`),
  attributes: () => fetcher("/api/ecommerce/attributes"),
  attribute: (id: string) => fetcher(`/api/ecommerce/attributes/${id}`),
  shippingZones: () => fetcher("/api/ecommerce/shipping-zones"),
  shippingZone: (id: string) => fetcher(`/api/ecommerce/shipping-zones/${id}`),
  taxClasses: () => fetcher("/api/ecommerce/tax-classes"),
  taxClass: (id: string) => fetcher(`/api/ecommerce/tax-classes/${id}`),
  coupons: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return fetcher(`/api/ecommerce/coupons${query ? `?${query}` : ""}`);
  },
  coupon: (id: string) => fetcher(`/api/ecommerce/coupons/${id}`),
  orders: (params?: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    const query = qs.toString();
    return fetcher(`/api/ecommerce/orders${query ? `?${query}` : ""}`);
  },
  order: (id: string) => fetcher(`/api/ecommerce/orders/${id}`),
  customers: (params?: { search?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return fetcher(`/api/ecommerce/customers${query ? `?${query}` : ""}`);
  },
  customer: (id: string) => fetcher(`/api/ecommerce/customers/${id}`),
  ecomSettings: () => fetcher("/api/ecommerce/settings"),
  ecomDashboard: () => fetcher("/api/ecommerce/dashboard"),


  // customers
  customersList: (params?: {
    search?: string;
    filter?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.filter) qs.set("filter", params.filter);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
    const query = qs.toString();
    return fetcher(`/api/customers${query ? `?${query}` : ""}`);
  },
  customerDetail: (userId: string | number) =>
    fetcher(`/api/customers/${userId}`),
};
