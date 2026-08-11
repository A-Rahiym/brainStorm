"use client";

import { useEffect, useRef } from "react";
import { BookOpen, Play, X } from "lucide-react";
import { Avatar, Badge, Button } from "@/components/ui";
import { ClockIcon } from "@/components/icons";
import { usePeriodStore } from "@/store/period.store";

const POPOVER_WIDTH = 470;
const GAP = 12;
const EDGE = 16;

export function PeriodPopover() {
  const subjectName = usePeriodStore((s) => s.subjectName);
  const period = usePeriodStore((s) => s.period);
  const anchorRect = usePeriodStore((s) => s.anchorRect);
  const closePeriod = usePeriodStore((s) => s.closePeriod);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!period) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePeriod();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) closePeriod();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [period, closePeriod]);

  if (!period || !anchorRect || typeof window === "undefined") return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const leftOfAnchor = anchorRect.left - POPOVER_WIDTH - GAP;
  const rightOfAnchor = anchorRect.right + GAP;
  const left =
    anchorRect.left >= vw / 2
      ? Math.max(EDGE, leftOfAnchor)
      : Math.min(rightOfAnchor, vw - POPOVER_WIDTH - EDGE);
  const top = Math.min(Math.max(EDGE, anchorRect.top), Math.max(EDGE, vh - 420));

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-label="Period details"
      style={{ left, top, width: POPOVER_WIDTH }}
      className="fixed z-50 max-w-[calc(100vw-32px)] rounded-2xl border border-border bg-surface p-5.5 shadow-[0_18px_48px_rgba(23,23,26,0.14),0_2px_6px_rgba(23,23,26,0.06)]"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
          <BookOpen  size={20} className="text-primary" /> Period
        </h3>
        <button
          type="button"
          aria-label="Close"
          onClick={closePeriod}
          className="grid h-9.5 w-9.5 place-items-center rounded-full border border-border text-text-primary transition-colors hover:bg-bg"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-3.5 border-b border-border pb-5">
        <Avatar
          name="Bello Salis Adam"
          size={52}
          className="!text-white"
          style={{ backgroundColor: "#7A5C4B" }}
        />
        <div>
          <p className="mb-1.5 text-base font-semibold text-text-primary">Bello Salis Adam</p>
          <span className="inline-flex h-8 items-center rounded-full border border-border-strong px-4 text-[13px] font-medium text-text-primary">
            {subjectName}
          </span>
        </div>
      </div>

      <div className="my-4 flex items-center gap-3">
        <span className="text-lg font-semibold text-primary">{subjectName}</span>
        <Badge tone="outline">{period.code === "DP" ? "Double Period" : "Single Period"}</Badge>
      </div>

      <div className="rounded-xl border border-border p-4 text-base font-medium text-text-primary">
        {period.topic}
      </div>
      <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-border p-4 text-base font-medium text-text-primary">
        <ClockIcon size={18} className="text-text-secondary" /> {period.time}
      </div>

      {period.status === "live" ? (
        <Button variant="primary" className="mt-4 w-full justify-center rounded-full">
          <Play size={15} fill="currentColor" /> Start Period
        </Button>
      ) : (
        <span className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-primary-pill text-sm font-semibold text-[#C08199]">
          Period Ended
        </span>
      )}
    </div>
  );
}
