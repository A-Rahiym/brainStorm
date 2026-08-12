"use client";

import { useState } from "react";
import { Button, Card, ControlPill } from "@/components/ui";
import { CalendarIcon, FilterIcon, PlusIcon } from "@/components/icons";
import { useUiStore } from "@/store/ui.store";
import { useSessionStore } from "@/store/session.store";
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
  const role = useSessionStore((s) => s.role);

  const months = monthOptions(selectedMonth);

  return (
    <Card className="flex flex-row gap-3 ">
      <div className="flex min-w-0 flex-1 flex-col">

        <div className="mb-4 flex  w-full items-center justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
            <CalendarIcon size={20} className="text-text-primary" />
            Calendar
          </h3>

          <ControlPill
            label="Month"
            value={selectedMonth.toISOString()}
            variant="outline"
            size="md"
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
      </div>

      <div className="w-px shrink-0 bg-border" aria-hidden />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3.5 mt-7 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">Agenda</h3>
          {role === "HEADMASTER" ? (
            <Button variant="dark" size="sm" className="h-8 rounded-full px-3.5">
              <PlusIcon size={13} /> Add
            </Button>
          ) : (
            <button
              aria-label="Filter agenda"
              className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg hover:text-text-primary"
            >
              <FilterIcon size={20} />
            </button>
          )}
        </div>

        <AgendaList items={agenda} />
      </div>
    </Card>
  );
}
