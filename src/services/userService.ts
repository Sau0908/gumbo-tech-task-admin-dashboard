import { api, json } from "../lib/api";
import type { User } from "../types";

export const userService = {
  list: () => api<User[]>("/users"),
  setBlocked: (id: string, isBlocked: boolean) =>
    api<User>(`/users/${id}/status`, {
      method: "PATCH",
      ...json({ isBlocked }),
    }),
};
