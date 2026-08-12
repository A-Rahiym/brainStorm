"use client";

import { Fragment, useState } from "react";
import { Play } from "lucide-react";
import { Card } from "@/components/ui";
import { CalendarIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, FilterIcon } from "@/components/icons";
import { MiniCalendar } from "@/components/charts/MiniCalendar";
import { usePeriodStore } from "@/store/period.store";
import { addMonths, monthLabel, padHour } from "@/features/subjects/utils/period";
import type { SubjectClassGroup, SubjectPeriod } from "@/features/subjects/types";

function PeriodCard({
  subjectName,
  period,
  onStartPeriod,
}: {
  subjectName: string;
  period: SubjectPeriod;
  onStartPeriod: (period: SubjectPeriod, anchorEl: HTMLElement) => void;
}) {
  const isActiveSession = usePeriodStore((s) => s.sessionOpen && s.period?.id === period.id);

  return (
    <article
      className={`relative rounded-xl border border-border bg-surface px-4.5 py-4 ${
        isActiveSession ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
    >
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 text-base font-semibold text-primary">
          {subjectName}
          <span className="inline-flex h-5 items-center rounded-[5px] bg-chip-bg px-1.75 text-[10px] font-bold tracking-[0.04em] text-text-secondary">
            {period.code}
          </span>
        </span>
        {period.status === "live" ? (
          <button
            type="button"
            onClick={(e) => onStartPeriod(period, e.currentTarget)}
            className="inline-flex h-11 items-center gap-2.25 rounded-full bg-primary px-5.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <Play size={15} fill="currentColor" /> Start Period
          </button>
        ) : (
          <span className="inline-flex h-10 items-center rounded-full bg-primary-pill px-5.5 text-sm font-semibold text-[#C08199]">
            Period Ended
          </span>
        )}
      </div>
      <p className="mb-2.5 text-lg font-semibold tracking-[-0.01em] text-text-primary">{period.topic}</p>
      <span className="inline-flex items-center gap-1.75 text-sm text-text-secondary">
        <ClockIcon size={15} /> {period.time}
      </span>
    </article>
  );
}

export function SubjectCalendarCard({
  subjectName,
  classes,
  onStartPeriod,
  eventDays = [],
  initialSelected,
}: {
  subjectName: string;
  classes: SubjectClassGroup[];
  onStartPeriod: (period: SubjectPeriod, anchorEl: HTMLElement) => void;
  eventDays?: Date[];
  initialSelected?: Date;
}) {
  const [month, setMonth] = useState<Date>(initialSelected ?? new Date());
  const hours = [...new Set(classes.flatMap((g) => g.periods.map((p) => p.startHour)))].sort((a, b) => a - b);

  return (
    <Card className="flex h-140 flex-col gap-4 sm:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
            <CalendarIcon size={20} className="text-text-primary" /> Calendar
          </h3>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button type="button" className="flex items-center gap-2 text-[15px] font-semibold text-text-primary">
            {monthLabel(month)}
            <ChevronDownIcon size={13} className="text-text-secondary" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonth(new Date())}
              className="h-10 rounded-full border border-border px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-bg"
            >
              Today
            </button>
            <div className="inline-flex items-center overflow-hidden rounded-full border border-border bg-surface">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setMonth((m) => addMonths(m, -1))}
                className="grid h-10 w-11.5 place-items-center border-r border-border text-text-primary transition-colors hover:bg-bg"
              >
                <ChevronLeftIcon size={17} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                className="grid h-10 w-11.5 place-items-center text-text-primary transition-colors hover:bg-bg"
              >
                <ChevronRightIcon size={17} />
              </button>
            </div>
          </div>
        </div>

        <MiniCalendar month={month} hideNavigation initialSelected={initialSelected} eventDays={eventDays} />
      </div>

      <div className="hidden w-px shrink-0 bg-border sm:block" aria-hidden />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="mb-4 flex flex-none items-center justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
            <CalendarIcon size={20} className="text-text-primary" /> Periods
          </h3>
          <button
            aria-label="Filter periods"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            <FilterIcon size={20} />
          </button>
        </div>

        <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
          {classes.map((group) => (
            <div key={group.className}>
              <div className="mb-4 inline-flex h-11 items-center gap-2.5 rounded-full border border-border pr-2 pl-4 text-sm text-text-secondary">
                Class{" "}
                <span className="inline-flex h-8 items-center rounded-full bg-bg px-3.5 font-semibold text-text-primary">
                  {group.className}
                </span>
              </div>
              <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-x-3">
                {hours.map((hour) => {
                  const period = group.periods.find((p) => p.startHour === hour);
                  return (
                    <Fragment key={hour}>
                      <span className="min-h-13 pt-0.5 text-[13px] font-semibold text-text-secondary">
                        {padHour(hour)}
                      </span>
                      <div className="relative min-h-13 pb-2">
                        <span className="absolute -left-3 right-0 top-2 h-px bg-border" />
                        {period && (
                          <PeriodCard subjectName={subjectName} period={period} onStartPeriod={onStartPeriod} />
                        )}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
