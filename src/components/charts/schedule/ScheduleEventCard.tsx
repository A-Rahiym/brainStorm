import { Clock, User } from "lucide-react";
import type { ScheduleBlock, ScheduleEvent } from "@/features/dashboard/constants/timeline";
import type { SubjectPeriod } from "@/features/subjects/types";

export function ScheduleEventCard({
  event,
  block,
  onSelectPeriod,
}: {
  event: ScheduleEvent;
  block: ScheduleBlock;
  onSelectPeriod?: (input: {
    subjectName: string;
    period: SubjectPeriod;
    anchorRect: DOMRect;
  }) => void;
}) {
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
                  status: block.now ? "live" : "ended",
                },
                anchorRect: e.currentTarget.getBoundingClientRect(),
              })
          : undefined
      }
      className={`block w-full -mt-px mb-2 rounded-xl border px-3.5 py-3 text-left transition-colors ${
        event.tone === "pink" ? "border-transparent bg-primary-pill" : "border-border bg-surface"
      } ${onSelectPeriod ? "cursor-pointer hover:border-primary/40" : ""}`}
    >
      <div className="mb-2.5 flex items-center gap-2 border-b border-dashed pb-2.5 [border-color:#E9B9C9]">
        <span className="text-[15px] font-semibold text-primary">{event.name}</span>
        {event.code && (
          <span className="inline-flex h-5 items-center rounded-[5px] bg-chip-bg px-1.75 text-[10px] font-bold tracking-[0.04em] text-text-secondary">
            {event.code}
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
    </button>
  );
}
