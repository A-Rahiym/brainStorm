"use client";

import { useQuery } from "@tanstack/react-query";
import { buildDemoHeadmasterDashboard } from "@/features/dashboard/demo";
import { useSessionStore } from "@/store/session.store";

export function useHeadmasterDashboard() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery({
    queryKey: ["dashboard", "headmaster", userId ?? "anon"],
    queryFn: () => buildDemoHeadmasterDashboard(),
  });
}
