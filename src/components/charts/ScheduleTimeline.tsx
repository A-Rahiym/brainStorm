"use client";

import { useState } from "react";
import { Clock, User } from "lucide-react";
import { ChevronDownIcon } from "@/components/icons";

export type ScheduleBlock = {
  id: string;
  timeLabel: string;
  now?: boolean;
  events: {
    id: string;
    name: string;
    code?: string;
    description?: string;
    time?: string;
    person?: string;
    tone: "red" | "pink" | "neutral";
  }[];
  break?: string;
};

const chipTones = {
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

export const TEACHER_BLOCKS: ScheduleBlock[] = [
  { id: "t08", timeLabel: "08:00", events: [] },
  {
    id: "t09",
    timeLabel: "09:00",
    now: true,
    events: [
      { id: "e1", name: "English", code: "DP", description: "Phonetics", time: "8:30 - 10:00", person: "Mr. Salis", tone: "red" },
    ],
  },
  {
    id: "t10",
    timeLabel: "10:00",
    events: [
      { id: "e2", name: "Mathematics", code: "DP", description: "Numbers & sequences", time: "10:00 - 11:30", person: "Me", tone: "pink" },
    ],
  },
  { id: "t11", timeLabel: "11:00", events: [], break: "11:30 - 12:00" },
  {
    id: "t12",
    timeLabel: "12:00",
    events: [
      { id: "e3", name: "Civic Education", code: "SP", time: "12:00 - 12:45", person: "Mr. Abubakar", tone: "red" },
    ],
  },
  {
    id: "t13",
    timeLabel: "01:00",
    events: [
      { id: "e4", name: "History", code: "SP", time: "12:00 - 12:45", person: "Mr. Abubakar", tone: "red" },
    ],
  },
  { id: "t14", timeLabel: "02:00", events: [] },
  { id: "t15", timeLabel: "03:00", events: [] },
  { id: "t16", timeLabel: "04:00", events: [] },
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

export function ScheduleTimeline({
  blocks,
  variant = "chip",
  afterStrip,
}: {
  blocks?: ScheduleBlock[];
  variant?: "card" | "chip";
  afterStrip?: React.ReactNode;
}) {
  const [activeDay, setActiveDay] = useState("14");
  const timeline = blocks ?? DEFAULT_BLOCKS;
  const isCard = variant === "card";

  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2 text-[15px] font-semibold text-text-primary">
        August 2026
        <ChevronDownIcon size={13} className="text-text-secondary" />
      </div>

      <div className="mb-4.5 grid grid-cols-7 gap-0.5">
        {DAY_STRIP.map(({ dow, num }) => (
          <button
            key={num}
            onClick={() => setActiveDay(num)}
            className="flex flex-col items-center gap-1.5 py-1"
            aria-pressed={activeDay === num}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold ${
                activeDay === num ? "bg-primary text-white" : "text-text-primary"
              }`}
            >
              {num}
            </span>
            <span className={`text-[11px] font-semibold ${activeDay === num ? "text-primary" : "text-text-secondary"}`}>
              {dow}
            </span>
          </button>
        ))}
      </div>

      {afterStrip}

      <div className="relative">
        {timeline.map((block) => (
          <div key={block.id} className="flex min-h-11 gap-2">
            <span
              className={`w-13 shrink-0 pt-0.5 text-xs ${
                isCard ? "font-medium text-text-muted" : "font-semibold text-text-secondary"
              }`}
            >
              {block.timeLabel}
            </span>
            <div className="relative flex-1 border-t border-border">
              {block.events.map((event) =>
                isCard ? (
                  <div
                    key={event.id}
                    className={`-mt-px mb-2 rounded-xl border px-3.5 py-3 ${
                      event.tone === "pink" ? "border-transparent bg-primary-pill" : "border-border bg-surface"
                    }`}
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
                  </div>
                ) : (
                  <div key={event.id} className={`-mt-px mb-2 rounded-full px-3 py-2.5 ${chipTones[event.tone].bg}`}>
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
                )
              )}
              {block.break &&
                (isCard ? (
                  <div className="-mt-px mb-2 flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-3">
                    <span className="text-[15px] font-semibold text-primary">Break</span>
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary">
                      <Clock size={13} /> {block.break}
                    </span>
                  </div>
                ) : (
                  <div className="-mt-px mb-2 flex items-center justify-between rounded-[10px] bg-schedule-red-bg px-3 py-2 text-xs font-extrabold text-schedule-red">
                    Break
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock size={11} /> {block.break}
                    </span>
                  </div>
                ))}
              {block.now && isCard && (
                <span
                  aria-hidden
                  className="absolute -left-3.5 top-1 h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-primary"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
