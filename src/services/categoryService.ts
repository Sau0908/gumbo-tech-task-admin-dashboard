import { api, json } from "../lib/api";
import type { Category, CategoryPayload } from "../types";

export const categoryService = {
  list: () => api<Category[]>("/categories"),
  create: (payload: CategoryPayload) =>
    api<Category>("/categories", { method: "POST", ...json(payload) }),
  update: (id: string, payload: CategoryPayload) =>
    api<Category>(`/categories/${id}`, { method: "PUT", ...json(payload) }),
  remove: (id: string) =>
    api<{ id: string }>(`/categories/${id}`, { method: "DELETE" }),
};
