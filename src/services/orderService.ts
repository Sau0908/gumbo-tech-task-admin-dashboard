import { api, json } from "../lib/api";
import type { Order, OrderStatus, Pagination } from "../types";

export const orderService = {
  list: (page = 1, status: OrderStatus | "" = "", limit = 10) =>
    api<{ orders: Order[]; pagination: Pagination }>(
      `/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
    ),
  updateStatus: (id: string, status: OrderStatus) =>
    api<Order>(`/orders/${id}/status`, {
      method: "PATCH",
      ...json({ status }),
    }),
};
