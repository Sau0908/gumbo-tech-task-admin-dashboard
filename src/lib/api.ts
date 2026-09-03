const API_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  errors?: unknown;
  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: unknown;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("admin_token");
  console.log(
    "API Request:",
    `${API_URL}${path}`,
    options,
    token ? "with token" : "without token",
  );
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let body: ApiEnvelope<T>;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(
      "The server returned an invalid response.",
      response.status,
    );
  }
  if (!response.ok || !body.success) {
    if (response.status === 401)
      window.dispatchEvent(new Event("auth:expired"));
    throw new ApiError(
      body.message || "Something went wrong.",
      response.status,
      body.errors,
    );
  }
  return body.data;
}

export const json = (value: unknown): RequestInit => ({
  body: JSON.stringify(value),
});
