import { api } from "../lib/axios";

export type OrderListParams = {
  search?: string;
  status?: string;
  paymentStatus?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type OrderUpdatePayload = {
  status?: string;
  paymentStatus?: string;
};

export type OrderNotePayload = {
  note: string;
  isCustomerVisible?: boolean;
};

export const orderService = {
  async getAll(params?: OrderListParams) {
    const res = await api.get("/ecommerce/orders", { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await api.get(`/ecommerce/orders/${id}`);
    return res.data;
  },

  async update(id: string, data: OrderUpdatePayload) {
    const res = await api.patch(`/ecommerce/orders/${id}`, data);
    return res.data;
  },

  async addNote(id: string, data: OrderNotePayload) {
    const res = await api.post(`/ecommerce/orders/${id}/notes`, data);
    return res.data;
  },

  async delete(id: string) {
    const res = await api.delete(`/ecommerce/orders/${id}`);
    return res.data;
  },
};
