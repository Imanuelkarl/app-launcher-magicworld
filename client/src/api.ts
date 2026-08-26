import type { AppInput, LauncherApp, User } from "./types";
const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(localStorage.getItem("mw_token")
        ? { Authorization: `Bearer ${localStorage.getItem("mw_token")}` }
        : {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Request failed");
  return body as T;
};
export const api = {
  apps: () => request<LauncherApp[]>("/api/apps?status=all"),
  publicApps: () => request<LauncherApp[]>("/api/apps"),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<User>("/api/auth/me"),
  saveApp: (app: Partial<AppInput>, id?: string) =>
    request<LauncherApp>(`/api/apps${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(app),
    }),
  deleteApp: (id: string) =>
    request<void>(`/api/apps/${id}`, { method: "DELETE" }),
  users: () => request<User[]>("/api/auth/users"),
  invite: (email: string, role: string) =>
    request<{ message: string; expiresInDays: number }>(
      "/api/auth/invitations",
      { method: "POST", body: JSON.stringify({ email, role }) },
    ),
  acceptInvite: (token: string, name: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token, name, password }),
    }),
};
