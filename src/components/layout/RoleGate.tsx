"use client";

import { useSessionStore, type Role } from "@/store/session.store";

export function RoleGate({
  roles,
  children,
  fallback = null,
}: {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const role = useSessionStore((s) => s.role);
  if (!role || !roles.includes(role)) return fallback;
  return <>{children}</>;
}
