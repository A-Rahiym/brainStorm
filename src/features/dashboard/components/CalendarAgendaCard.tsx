"use client";

import { useState } from "react";
import { Button, Card, ControlPill } from "@/components/ui";
import { CalendarIcon, PlusIcon } from "@/components/icons";
import { useUiStore } from "@/store/ui.store";
import { MiniCalendar } from "@/components/charts/MiniCalendar";
import { AgendaList, type AgendaItem } from "@/components/charts/AgendaList";

function monthOptions(month: Date): Date[] {
  return Array.from({ length: 12 }, (_, i) => new Date(month.getFullYear(), i, 1));
}

const monthLabel = (d: Date) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

export function CalendarAgendaCard({
  agenda,
  month,
  selected,
  eventDays,
}: {
  agenda: AgendaItem[];
  month?: Date;
  selected?: Date;
  eventDays?: Date[];
}) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(month ?? new Date());
  const setCalendarMonth = useUiStore((s) => s.setCalendarMonth);

  const months = monthOptions(selectedMonth);

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex  w-full items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary">
          <CalendarIcon size={17} className="text-text-secondary" />
          Calendar
        </h3>

        <ControlPill
          label="Month"
          value={selectedMonth.toISOString()}
          onChange={(v) => {
            const next = new Date(v);
            setSelectedMonth(next);
            setCalendarMonth(next);
          }}
        >
          {months.map((m) => (
            <option key={m.toISOString()} value={m.toISOString()}>
              {monthLabel(m)}
            </option>
          ))}
        </ControlPill>
      </div>
      <MiniCalendar
        month={selectedMonth}
        hideNavigation
        initialSelected={selected}
        eventDays={eventDays}
      />

      <div className="mt-6 mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-text-primary">Agenda</h3>
        <Button variant="dark" size="sm" className="h-8 rounded-full px-3.5">
          <PlusIcon size={13} /> Add
        </Button>
      </div>

      <AgendaList items={agenda} />
    </Card>
  );
}
