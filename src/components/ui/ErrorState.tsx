"use client";

import { WifiOff, Lock, ServerCrash, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError, NetworkError, TimeoutError } from "@/lib/request";

export type ErrorKind = "offline" | "notFound" | "forbidden" | "serverError";

const copy: Record<ErrorKind, { title: string; description: string; icon: React.ReactNode; retry: boolean }> = {
  offline: {
    title: "Server unreachable",
    description: "Check your connection",
    icon: <WifiOff size={28} />,
    retry: true,
  },
  notFound: {
    title: "Nothing here yet",
    description: "No records match this view",
    icon: <SearchX size={28} />,
    retry: false,
  },
  forbidden: {
    title: "Permission denied",
    description: "You don't have permission to view this",
    icon: <Lock size={28} />,
    retry: false,
  },
  serverError: {
    title: "Something went wrong",
    description: "Please try again",
    icon: <ServerCrash size={28} />,
    retry: true,
  },
};

export function errorKind(error: unknown): ErrorKind {
  if (error instanceof NetworkError || error instanceof TimeoutError) return "offline";
  if (error instanceof ApiError) {
    if (error.code === "NOT_FOUND") return "notFound";
    if (error.code === "FORBIDDEN" || error.code === "UNAUTHORIZED") return "forbidden";
    return "serverError";
  }
  return "serverError";
}

export function ErrorState({
  error,
  onRetry,
  className = "",
}: {
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const kind = errorKind(error);
  const { title, description, icon, retry } = copy[kind];
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface p-10 text-center ${className}`}
      role="alert"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-bg text-text-muted">
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-text-primary">{title}</p>
        <p className="mt-1 text-[13px] text-text-secondary">{description}</p>
      </div>
      {retry && onRetry && <Button size="sm" onClick={onRetry}>Retry</Button>}
    </div>
  );
}
