import type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  LoginCredentials,
  AuthToken,
  User,
  Document,
  FilterOptions,
  DocumentFilters,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("auth_token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      message: `HTTP ${res.status}: ${res.statusText}`,
    }));
    throw new ApiRequestError(err.message, res.status, err.errors);
  }

  return res.json() as Promise<T>;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login: (credentials: LoginCredentials) =>
    apiFetch<ApiResponse<AuthToken>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiFetch<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => apiFetch<ApiResponse<User>>("/auth/me"),

  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    apiFetch<ApiResponse<AuthToken>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── Generic CRUD factory ──────────────────────────────────────────────────────

export function createResource<T extends { id: number }>(basePath: string) {
  return {
    list: (params?: Record<string, string | number>) => {
      const query = params
        ? "?" + new URLSearchParams(params as Record<string, string>).toString()
        : "";
      return apiFetch<PaginatedResponse<T>>(`${basePath}${query}`);
    },

    get: (id: number) => apiFetch<ApiResponse<T>>(`${basePath}/${id}`),

    create: (data: Omit<T, "id">) =>
      apiFetch<ApiResponse<T>>(basePath, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: number, data: Partial<Omit<T, "id">>) =>
      apiFetch<ApiResponse<T>>(`${basePath}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    replace: (id: number, data: Omit<T, "id">) =>
      apiFetch<ApiResponse<T>>(`${basePath}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    destroy: (id: number) =>
      apiFetch<{ message: string }>(`${basePath}/${id}`, {
        method: "DELETE",
      }),
  };
}

// ── Example resources — add yours here ───────────────────────────────────────

export interface Post {
  id: number;
  title: string;
  body: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export const posts = createResource<Post>("/posts");

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export const categories = createResource<Category>("/categories");

// ── Documents ─────────────────────────────────────────────────────────────────

export const documentApi = {
  list: (params?: DocumentFilters) => {
    const clean = Object.fromEntries(
      Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== "")
    ) as Record<string, string>;
    const query = Object.keys(clean).length
      ? "?" + new URLSearchParams(clean).toString()
      : "";
    return apiFetch<PaginatedResponse<Document>>(`/v1/documents${query}`);
  },
  get: (slug: string) => apiFetch<ApiResponse<Document>>(`/v1/documents/${slug}`),
};

export const getFilters = () => apiFetch<FilterOptions>("/v1/filters");
