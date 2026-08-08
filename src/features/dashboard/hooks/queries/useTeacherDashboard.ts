"use client";

import { useQuery } from "@tanstack/react-query";
import { buildDemoTeacherDashboard } from "@/features/dashboard/demo";
import { useSessionStore } from "@/store/session.store";

export function useTeacherDashboard() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery({
    queryKey: ["dashboard", "teacher", userId ?? "anon"],
    queryFn: () => buildDemoTeacherDashboard(),
  });
}
