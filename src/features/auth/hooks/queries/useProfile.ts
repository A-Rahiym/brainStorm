"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/features/auth/request";
import { useSessionStore } from "@/store/session.store";

export function useProfile() {
  const userId = useSessionStore((s) => s.userId);
  const setProfile = useSessionStore((s) => s.setProfile);

  const query = useQuery({
    queryKey: ["auth", "profile", userId ?? "anon"],
    queryFn: fetchProfile,
    enabled: !!userId,
  });

  useEffect(() => {
    if (query.data) {
      setProfile({ name: query.data.name, avatar: query.data.avatar });
    }
  }, [query.data, setProfile]);

  return query;
}
