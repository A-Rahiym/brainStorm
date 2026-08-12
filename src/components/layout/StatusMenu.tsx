"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { ChevronRightIcon } from "@/components/icons";
import { useSessionStore, type PresenceStatus } from "@/store/session.store";

const STATUS_OPTIONS: {
  value: PresenceStatus;
  label: string;
  dot: string;
  bg: string;
  text: string;
}[] = [
    { value: "active", label: "Active", dot: "bg-success-text", bg: "bg-success-bg", text: "text-success-text" },
    { value: "busy", label: "Busy", dot: "bg-warning-text", bg: "bg-warning-bg", text: "text-warning-text" },
    {
      value: "unavailable",
      label: "Unavailable",
      dot: "bg-schedule-red",
      bg: "bg-schedule-red-bg",
      text: "text-schedule-red",
    },
    { value: "offline", label: "Offline", dot: "bg-text-muted", bg: "bg-chip-bg", text: "text-text-secondary" },
  ];

export function StatusMenu() {
  const status = useSessionStore((s) => s.status);
  const setStatus = useSessionStore((s) => s.setStatus);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative mt-4.5 flex items-center justify-between ">

      <div className="flex justify-between items-center w-full border p-2 border-border rounded-full">
        <span
          className={`inline-flex h-7.5 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold ${current.bg} ${current.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
          {current.label}
        </span>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Status
          <ChevronRightIcon size={14} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
      </div>

      {open && (
        <div
          role="menu"
          aria-label="Change status"
          className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-border bg-surface p-1.5 shadow-[0_18px_48px_rgba(23,23,26,0.14),0_2px_6px_rgba(23,23,26,0.06)]"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === status}
              onClick={() => {
                setStatus(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-bg ${option.value === status ? "text-text-primary" : "text-text-secondary"
                }`}
            >
              <span className={`h-2 w-2 rounded-full ${option.dot}`} />
              {option.label}
              {option.value === status && <Check size={14} className="ml-auto text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
