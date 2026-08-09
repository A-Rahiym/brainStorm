import { apiFetch, type SingleResponse } from "@/lib/api-client";
import type { LoginRequest, LoginResponse, SessionResponse } from "@/features/auth/types";

export async function loginUser(body: LoginRequest): Promise<LoginResponse> {
  const res = await apiFetch<SingleResponse<LoginResponse>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function getSession(): Promise<SessionResponse> {
  const res = await apiFetch<SingleResponse<SessionResponse>>("/auth/session");
  return res.data;
}

export async function logoutUser(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
}
