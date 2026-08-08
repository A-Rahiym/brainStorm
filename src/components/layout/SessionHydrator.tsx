"use client";

import { useEffect } from "react";
import { useSessionStore, type Role } from "@/store/session.store";

export type HydratedSession = {
  userId: string;
  role: Role;
  schoolId: string | null;
  teacherId?: string;
  headmasterId?: string;
};

export function SessionHydrator({ session }: { session: HydratedSession | null }) {
  const setSession = useSessionStore((s) => s.setSession);

  useEffect(() => {
    if (session) setSession(session);
  }, [session, setSession]);

  return null;
}
