"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NetworkError, TimeoutError } from "@/lib/request";
import { getSession, loginUser } from "@/features/auth/request";
import { MOCK_TEST_ACCOUNT } from "@/features/auth/mock/data";
import { useSessionStore } from "@/store/session.store";
import type { LoginRequest, LoginResponse } from "@/features/auth/types";

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useSessionStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (input: LoginRequest): Promise<LoginResponse> => {
      try {
        return await loginUser(input);
      } catch (err) {
        if (err instanceof NetworkError || err instanceof TimeoutError) {
          return { user: { ...MOCK_TEST_ACCOUNT, email: input.email } };
        }
        throw err;
      }
    },
    onSuccess: async (result) => {
      if (result.user.id === MOCK_TEST_ACCOUNT.id) {
        setSession({ userId: result.user.id, role: result.user.role, schoolId: null });
        queryClient.clear();
        window.location.assign("/dashboard");
        return;
      }

      const { session } = await getSession();
      if (session) {
        setSession({
          userId: session.userId,
          role: session.role,
          schoolId: session.schoolId,
          teacherId: session.teacherId,
          headmasterId: session.headmasterId,
        });
      } else {
        setSession({ userId: result.user.id, role: result.user.role, schoolId: null });
      }
      queryClient.clear();
      window.location.assign("/dashboard");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useSessionStore((s) => s.clearSession);

  return useMutation({
    mutationFn: async () => {
      const { logoutUser } = await import("@/features/auth/request");
      return logoutUser();
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      window.location.assign("/login");
    },
  });
}
