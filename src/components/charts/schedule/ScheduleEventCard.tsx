"use client";

import { useEffect, useState } from "react";
import { Clock, User } from "lucide-react";
import type { ScheduleEvent } from "@/features/dashboard/constants/timeline";
import type { SubjectPeriod } from "@/features/subjects/types";

function parseProgress(time: string | undefined, now: Date): number | null {
  const match = time?.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, sh, sm, eh, em] = match.slice(1).map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (end <= start) return null;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return Math.min(1, Math.max(0, (nowMinutes - start) / (end - start)));
}

export function ScheduleEventCard({
  event,
  onSelectPeriod,
}: {
  event: ScheduleEvent;
  onSelectPeriod?: (input: {
    subjectName: string;
    period: SubjectPeriod;
    anchorRect: DOMRect;
  }) => void;
}) {
  const isLive = event.live ?? false;
  const canStart = isLive && event.isMine === true;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [isLive]);

  const progress = isLive ? (parseProgress(event.time, now) ?? 0) : null;

  const body = (
    <>
      <div className={`relative flex items-center gap-2 mb-2.5 ${isLive ? "pb-2.5" : ""}`}>
        <span className="text-[15px] font-semibold text-primary">{event.name}</span>
        {event.code && (
          <span className="inline-flex h-5 items-center rounded-[5px] bg-chip-bg px-1.75 text-[10px] font-bold tracking-[0.04em] text-text-secondary">
            {event.code}
          </span>
        )}
        {isLive && (
          <span
            className="absolute inset-x-0 bottom-0 h-[1px]"
            style={{
              backgroundImage: "repeating-linear-gradient(to right, #E9B9C9 0 3px, transparent 3px 5px)",
            }}
          >
            <span
              className="block h-full overflow-hidden transition-[width] duration-500"
              style={{
                width: `${(progress ?? 0) * 100}%`,
                backgroundImage:
                  "repeating-linear-gradient(to right, var(--color-primary) 0 3px, transparent 3px 5px)",
              }}
            />
          </span>
        )}
      </div>
      {event.description && (
        <p className="mb-2 text-sm font-semibold text-text-primary">{event.description}</p>
      )}
      <div className="flex items-center gap-4 text-[13px] font-semibold text-text-secondary">
        {event.time && (
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {event.time}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <User size={13} /> {event.person ?? "Me"}
        </span>
      </div>
    </>
  );

  const toneClass = event.tone === "pink" ? "border-transparent bg-primary-pill" : "border-border bg-surface";

  if (!canStart) {
    return <div className={`block w-full -mt-px mb-2 rounded-xl border px-3.5 py-3 text-left ${toneClass}`}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={
        onSelectPeriod
          ? (e) =>
              onSelectPeriod({
                subjectName: event.name,
                period: {
                  id: event.id,
                  startHour: 0,
                  topic: event.description ?? event.name,
                  time: event.time ?? "",
                  code: event.code === "DP" ? "DP" : "SP",
                  status: "live",
                  isMine: event.isMine ?? true,
                },
                anchorRect: e.currentTarget.getBoundingClientRect(),
              })
          : undefined
      }
      className={`block w-full -mt-px mb-2 rounded-xl border px-3.5 py-3 text-left transition-colors ${toneClass} ${
        onSelectPeriod ? "cursor-pointer hover:border-primary/40" : ""
      }`}
    >
      {body}
    </button>
  );
}
