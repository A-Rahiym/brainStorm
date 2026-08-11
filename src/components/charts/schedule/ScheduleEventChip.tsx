import { Clock, User } from "lucide-react";
import type { ScheduleEvent } from "@/features/dashboard/constants/timeline";

const chipTones = {
  red: { bg: "bg-schedule-red-bg", name: "text-schedule-red" },
  pink: { bg: "bg-schedule-pink", name: "text-primary" },
  neutral: { bg: "bg-bg", name: "text-text-primary" },
};

export function ScheduleEventChip({ event }: { event: ScheduleEvent }) {
  return (
    <div className={`-mt-px mb-2 rounded-full px-3 py-2.5 ${chipTones[event.tone].bg}`}>
      <div className={`text-[13px] font-semibold ${chipTones[event.tone].name}`}>{event.name}</div>
      {event.description && (
        <div className="mb-1.5 text-xs font-semibold text-text-primary">{event.description}</div>
      )}
      <div className="flex items-center gap-2.5 text-[11px] font-semibold text-text-muted">
        {event.time && (
          <span className="flex items-center gap-1">
            <Clock size={11} /> {event.time}
          </span>
        )}
        <span className="flex items-center gap-1">
          <User size={11} /> {event.person ?? "Me"}
        </span>
      </div>
    </div>
  );
}
