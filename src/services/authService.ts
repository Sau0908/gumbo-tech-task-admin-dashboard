import { api, json } from "../lib/api";
import type { User } from "../types";

export const authService = {
  getMe: () => api<User>("/auth/me"),
  adminLogin: (email: string, password: string) =>
    api<{ user: User; token: string }>("/auth/admin/login", {
      method: "POST",
      ...json({ email, password }),
    }),
  registerAdmin: (name: string, email: string, password: string) =>
    api<{ user: User; token: string }>("/auth/admin/register", {
      method: "POST",
      ...json({ name, email, password }),
    }),
};
