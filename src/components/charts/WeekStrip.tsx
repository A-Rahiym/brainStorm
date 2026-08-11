"use client";

import { useEffect, useRef } from "react";
import { DayPicker, type DayButtonProps } from "react-day-picker";
import "react-day-picker/style.css";
import { ControlPill } from "@/components/ui";
import { useUiStore } from "@/store/ui.store";
import { monthKey, monthOptions } from "@/features/dashboard/utils/month";

const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function StripDayButton({ day, modifiers, onClick }: DayButtonProps) {
  const dow = DOW[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1];
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={modifiers.selected || undefined}
      className="flex w-9 flex-col items-center gap-1.5 py-1"
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full border border-border text-[13px] font-semibold ${
          modifiers.selected
            ? "bg-primary text-white"
            : modifiers.today
              ? "text-primary ring-1 ring-primary"
              : "text-text-primary"
        }`}
      >
        {day.date.getDate()}
      </span>
      <span
        className={`text-[11px] font-semibold ${modifiers.selected ? "text-primary" : "text-text-secondary"}`}
      >
        {dow}
      </span>
    </button>
  );
}

export function WeekStrip() {
  const calendarMonth = useUiStore((s) => s.calendarMonth);
  const setCalendarMonth = useUiStore((s) => s.setCalendarMonth);
  const selectedDate = useUiStore((s) => s.selectedDate);
  const setSelectedDate = useUiStore((s) => s.setSelectedDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current
      ?.querySelector('[data-selected="true"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [calendarMonth, selectedDate]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <ControlPill
          variant="default"
          size="sm"
          aria-label="Month"
          value={monthKey(calendarMonth)}
          options={monthOptions}
          onChange={(value) => {
            const [y, m] = value.split("-").map(Number);
            setCalendarMonth(new Date(y, m - 1, 1));
          }}
        />
      </div>

      <div ref={scrollRef} className="scrollbar-none -mx-1 overflow-x-auto px-1 pb-1">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(day) => day && setSelectedDate(day)}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          weekStartsOn={1}
          showOutsideDays
          hideNavigation
          className="brain-strip"
          classNames={{
            months: "brain-strip-months",
            month: "brain-strip-month",
            month_caption: "hidden",
            month_grid: "brain-strip-grid",
            weekdays: "hidden",
            weeks: "brain-strip-weeks",
            week: "brain-strip-week",
            day: "brain-strip-day",
          }}
          components={{ DayButton: StripDayButton }}
        />
      </div>
    </div>
  );
}
