import { apiFetch } from "@/lib/api-client";
import type { LoginRequest, LoginResponse, SessionResponse } from "@/features/auth/types";

export async function loginUser(body: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) });
}

export async function getSession(): Promise<SessionResponse> {
  return apiFetch<SessionResponse>("/auth/session");
}

export async function logoutUser(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}
