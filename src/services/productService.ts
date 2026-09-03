import { api, json } from "../lib/api";
import type { Pagination, Product, ProductPayload } from "../types";

export const productService = {
  list: (page = 1, search = "") =>
    api<{ products: Product[]; pagination: Pagination }>(
      `/products?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
    ),
  create: (payload: ProductPayload) =>
    api<Product>("/products", { method: "POST", ...json(payload) }),
  update: (id: string, payload: ProductPayload) =>
    api<Product>(`/products/${id}`, { method: "PUT", ...json(payload) }),
  remove: (id: string) =>
    api<{ id: string }>(`/products/${id}`, { method: "DELETE" }),
};
