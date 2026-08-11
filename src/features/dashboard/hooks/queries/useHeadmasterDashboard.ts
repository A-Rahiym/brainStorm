"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { MOCK_HEADMASTER_DASHBOARD } from "@/features/dashboard/mock/dashboard";
import type { HeadmasterDashboard } from "@/features/dashboard/types";

async function fetchHeadmasterDashboard(): Promise<HeadmasterDashboard> {
  const res = await fetch("/api/v1/dashboard", { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Failed to load dashboard");
  }
  const body = await res.json();
  return body.data as HeadmasterDashboard;
}

export function useHeadmasterDashboard() {
  const userId = useSessionStore((s) => s.userId);
  return useQuery({
    queryKey: ["dashboard", "headmaster", userId ?? "anon"],
    queryFn: async () => {
      try {
        return await fetchHeadmasterDashboard();
      } catch {
        return MOCK_HEADMASTER_DASHBOARD;
      }
    },
  });
}
