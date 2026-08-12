"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export function MiniCalendar({
  eventDays,
  className = "",
  initialMonth,
  initialSelected,
  month,
  hideNavigation = false,
}: {
  eventDays?: Date[];
  className?: string;
  initialMonth?: Date;
  initialSelected?: Date;
  month?: Date;
  hideNavigation?: boolean;
}) {
  const [monthState, setLocalMonth] = useState<Date>(initialMonth ?? initialSelected ?? new Date());
  const [localSelected, setLocalSelected] = useState<Date | undefined>(initialSelected);

  const displayMonth = month ?? monthState;
  const eventSet = new Set((eventDays ?? []).map((d) => d.toDateString()));

  return (
    <DayPicker
      mode="single"
      selected={localSelected}
      onSelect={(day) => {
        if (day) setLocalSelected(day);
      }}
      month={displayMonth}
      onMonthChange={setLocalMonth}
      hideNavigation={hideNavigation}
      modifiers={{ hasEvent: (day) => eventSet.has(day.toDateString()) }}
      modifiersClassNames={{ hasEvent: "brain-cal-event" }}
      className={`brain-cal ${hideNavigation ? "brain-cal-hide-caption" : ""} ${className}`}
      classNames={{
        months: "brain-months",
        month: "brain-month",
        month_grid: "brain-month-grid",
        month_caption: "brain-caption",
        caption_label: "brain-caption-label",
        nav: "brain-nav",
        button_previous: "brain-prev",
        button_next: "brain-next",
        weekdays: "brain-weekdays",
        weekday: "brain-weekday",
        week: "brain-week",
        day: "m-1 p-0 font-normal aria-selected:opacity-100",
        day_button: "brain-day-button",
        selected: "brain-selected",
        today: "brain-today",
        outside: "brain-outside",
      }}
    />
  );
}
