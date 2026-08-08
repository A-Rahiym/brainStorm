"use client";

import { useState } from "react";
import { Clock, User } from "lucide-react";
import { ChevronDownIcon } from "@/components/icons";

export type ScheduleBlock = {
  id: string;
  timeLabel: string;
  events: {
    id: string;
    name: string;
    description?: string;
    time?: string;
    tone: "red" | "pink" | "neutral";
  }[];
  break?: string;
};

const toneStyles = {
  red: { bg: "bg-schedule-red-bg", name: "text-schedule-red" },
  pink: { bg: "bg-schedule-pink", name: "text-primary" },
  neutral: { bg: "bg-bg", name: "text-text-primary" },
};

const DAY_STRIP = [
  { dow: "Mon", num: "14" },
  { dow: "Tue", num: "15" },
  { dow: "Wed", num: "16" },
  { dow: "Thu", num: "17" },
  { dow: "Fri", num: "18" },
  { dow: "Sat", num: "19" },
  { dow: "Sun", num: "20" },
];

const DEFAULT_BLOCKS: ScheduleBlock[] = [
  { id: "t08", timeLabel: "08:00", events: [] },
  {
    id: "t09",
    timeLabel: "09:00",
    events: [
      { id: "e1", name: "Staff meeting", description: "How to improve student recor...", time: "8:30 - 10:00", tone: "red" },
    ],
  },
  { id: "t10", timeLabel: "10:00", events: [] },
  {
    id: "t11",
    timeLabel: "11:00",
    events: [
      { id: "e2", name: "Contact Parent", description: "How to improve student recor...", time: "8:30 - 10:00", tone: "red" },
    ],
    break: "11:30 - 12:00",
  },
  { id: "t12", timeLabel: "12:00", events: [] },
  { id: "t13", timeLabel: "01:00", events: [] },
  { id: "t14", timeLabel: "02:00", events: [] },
  { id: "t15", timeLabel: "03:00", events: [] },
  { id: "t16", timeLabel: "04:00", events: [] },
  { id: "t17", timeLabel: "05:00", events: [] },
];

export function ScheduleTimeline({ blocks }: { blocks?: ScheduleBlock[] }) {
  const [activeDay, setActiveDay] = useState("14");
  const timeline = blocks ?? DEFAULT_BLOCKS;

  return (
    <div>
      <div className="mb-3.5 flex items-center gap-1.5 text-sm font-bold text-text-primary">
        August 2026
        <ChevronDownIcon size={13} className="text-text-muted" />
      </div>

      <div className="mb-5 flex gap-2">
        {DAY_STRIP.map(({ dow, num }) => (
          <button
            key={num}
            onClick={() => setActiveDay(num)}
            className="flex flex-1 flex-col items-center gap-1.5 rounded-full py-2 transition-colors"
            aria-pressed={activeDay === num}
          >
            <span
              className={`flex h-7.5 w-7.5 items-center justify-center rounded-full text-[13px] font-bold ${
                activeDay === num ? "bg-primary text-white" : "text-text-primary"
              }`}
            >
              {num}
            </span>
            <span className={`text-[11px] font-semibold ${activeDay === num ? "text-primary" : "text-text-muted"}`}>
              {dow}
            </span>
          </button>
        ))}
      </div>

      <div className="relative">
        {timeline.map((block) => (
          <div key={block.id} className="flex min-h-14 gap-3">
            <span className="w-11 shrink-0 pt-0.5 text-right text-xs font-semibold text-text-muted">
              {block.timeLabel}
            </span>
            <div className="relative flex-1 border-t border-border">
              {block.events.map((event) => {
                const styles = toneStyles[event.tone];
                return (
                  <div key={event.id} className={`mb-2 -mt-px rounded-full px-3 py-2.5 ${styles.bg}`}>
                    <div className={`text-[13px] font-semibold ${styles.name}`}>{event.name}</div>
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
                        <User size={11} /> Me
                      </span>
                    </div>
                  </div>
                );
              })}
              {block.break && (
                <div className="-mt-px mb-2 flex items-center justify-between rounded-[10px] bg-schedule-red-bg px-3 py-2 text-xs font-extrabold text-schedule-red">
                  Break
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock size={11} /> {block.break}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
