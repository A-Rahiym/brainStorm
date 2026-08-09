"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession, loginUser } from "@/features/auth/api";
import { useSessionStore } from "@/store/session.store";

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useSessionStore((s) => s.setSession);

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (result) => {
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
      const { logoutUser } = await import("@/features/auth/api");
      return logoutUser();
    },
    onSuccess: () => {
      clearSession();
      queryClient.clear();
      window.location.assign("/login");
    },
  });
}
