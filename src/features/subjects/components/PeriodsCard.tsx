"use client";

import { Fragment } from "react";
import { Play } from "lucide-react";
import { Button, Card } from "@/components/ui";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  PlusIcon,
} from "@/components/icons";
import type { SubjectClassGroup, SubjectPeriod, WeekDay } from "@/features/subjects/types";

const HOURS = [8, 9, 10];

function padHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function PeriodCard({
  subjectName,
  period,
  onStartPeriod,
}: {
  subjectName: string;
  period: SubjectPeriod;
  onStartPeriod: (period: SubjectPeriod) => void;
}) {
  return (
    <article className="relative rounded-xl border border-border bg-surface px-4.5 py-4">
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
            onClick={() => onStartPeriod(period)}
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

export function PeriodsCard({
  subjectName,
  classes,
  weekDays,
  onStartPeriod,
}: {
  subjectName: string;
  classes: SubjectClassGroup[];
  weekDays: WeekDay[];
  onStartPeriod: (period: SubjectPeriod) => void;
}) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
          <CalendarIcon size={20} className="text-text-primary" /> Periods
        </h3>
        <Button variant="dark" className="h-10 rounded-full px-4.5">
          <PlusIcon size={16} /> Add
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <button type="button" className="flex items-center gap-2 text-[15px] font-semibold text-text-primary">
          August 2026
          <ChevronDownIcon size={13} className="text-text-secondary" />
        </button>
        <div className="inline-flex items-center overflow-hidden rounded-full border border-border bg-surface">
          <button
            type="button"
            aria-label="Previous week"
            className="grid h-10 w-11.5 place-items-center border-r border-border text-text-primary transition-colors hover:bg-bg"
          >
            <ChevronLeftIcon size={17} />
          </button>
          <button
            type="button"
            aria-label="Next week"
            className="grid h-10 w-11.5 place-items-center text-text-primary transition-colors hover:bg-bg"
          >
            <ChevronRightIcon size={17} />
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => (
          <div key={day.num} className="text-center">
            <span className="mb-2 block text-sm font-medium text-text-secondary">{day.dow}</span>
            <span
              className={`relative mx-auto flex h-13.5 w-13.5 items-center justify-center rounded-xl border border-border text-base font-medium ${
                day.current ? "!border-primary text-text-primary" : day.marked ? "text-[#E58A0B]" : "text-text-primary"
              }`}
            >
              {day.num}
              {(day.marked || day.current) && (
                <span className="absolute bottom-2.25 left-1/2 h-1.25 w-1.25 -translate-x-1/2 rounded-full bg-[#E58A0B]" />
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {classes.map((group) => (
          <div key={group.className}>
            <div className="mb-4 inline-flex h-11 items-center gap-2.5 rounded-full border border-border pr-2 pl-4 text-sm text-text-secondary">
              Class{" "}
              <span className="inline-flex h-8 items-center rounded-full bg-bg px-3.5 font-semibold text-text-primary">
                {group.className}
              </span>
            </div>
            <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-x-3">
              {HOURS.map((hour) => {
                const period = group.periods.find((p) => p.startHour === hour);
                return (
                  <Fragment key={hour}>
                    <span className="min-h-13 pt-0.5 text-[13px] font-semibold text-text-secondary">
                      {padHour(hour)}
                    </span>
                    <div className="relative min-h-13 pb-2">
                      <span className="absolute -left-3 right-0 top-2 h-px bg-border" />
                      {period && (
                        <PeriodCard
                          subjectName={subjectName}
                          period={period}
                          onStartPeriod={onStartPeriod}
                        />
                      )}
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
