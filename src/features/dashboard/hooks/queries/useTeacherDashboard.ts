"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import type { TeacherDashboard } from "@/features/dashboard/types";

async function fetchTeacherDashboard(): Promise<TeacherDashboard> {
  const res = await fetch("/api/v1/dashboard", { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Failed to load dashboard");
  }
  const body = await res.json();
  return body.data as TeacherDashboard;
}

export function useTeacherDashboard() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery({
    queryKey: ["dashboard", "teacher", userId ?? "anon"],
    queryFn: fetchTeacherDashboard,
  });
}
