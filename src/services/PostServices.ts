import { api } from "../lib/axios";

export const postService = {
  // ─── GET ALL POSTS ─────────────────────────
  async getAll() {
    const res = await api.get("/posts");
    return res.data;
  },

  // ─── GET POST BY ID ───────────────────────
  async getById(id: string) {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },

  // ─── CREATE POST ──────────────────────────
  async create(data: any) {
    const res = await api.post("/posts", data);
    return res.data;
  },

  // ─── UPDATE POST ──────────────────────────
  async update(id: string, data: any) {
    const res = await api.put(`/posts/${id}`, data);
    return res.data;
  },

  // ─── DELETE POST ──────────────────────────
  async delete(id: string) {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },

  // ─── PUBLISH POST ─────────────────────────
  async publish(id: string) {
    const res = await api.post(`/posts/${id}/publish`);
    return res.data;
  },

  // ─── UNPUBLISH POST ───────────────────────
  async unpublish(id: string) {
    const res = await api.post(`/posts/${id}/unpublish`);
    return res.data;
  },

  // ─── CHECK SLUG AVAILABILITY ──────────────
  async checkSlug(slug: string, excludeId?: string) {
    const res = await api.post(`/posts/slug/${slug}/check`, {
      excludeId: excludeId ?? null,
    });
    return res.data;
  },
};

// ─── CATEGORIES ───────────────────────────────────────────

export const categoryService = {
  async getAll() {
    const res = await api.get("/categories");
    return res.data.data;
  },

  async getById(id: string) {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },

  async create(data: any) {
    const res = await api.post("/categories", data);
    return res.data;
  },

  async update(id: string, data: any) {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

// ─── TAGS ─────────────────────────────────────────────────

export const tagService = {
  async getAll() {
    const res = await api.get("/tags");
    return res.data.data;
  },

  async getById(id: string) {
    const res = await api.get(`/tags/${id}`);
    return res.data;
  },

  async create(data: any) {
    const res = await api.post("/tags", data);
    return res.data;
  },

  async update(id: string, data: any) {
    const res = await api.put(`/tags/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/tags/${id}`);
    return res.data;
  },
};