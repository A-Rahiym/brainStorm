"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, Square, ChevronDown } from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, PlusIcon, UsersIcon, XIcon } from "@/components/icons";
import { usePeriodStore } from "@/store/period.store";
import { useUiStore } from "@/store/ui.store";
import { MOCK_ATTENDANCE_ROWS } from "@/features/attendance/mock/data";
import { StudentAttendanceCard } from "@/features/subjects/components/StudentAttendanceCard";
import { parseTimeRange } from "@/features/subjects/utils/period";
import type { AttendanceStatus } from "@/features/attendance/types";

function BookmarkGlyph() {
  return (
    <span className="flex gap-0.5" aria-hidden>
      <span className="block h-5 w-2 rounded-l-[3px] bg-primary" />
      <span className="block h-5 w-2 rounded-r-[3px] bg-primary" />
    </span>
  );
}

export function PeriodSessionModal() {
  const subjectName = usePeriodStore((s) => s.subjectName);
  const period = usePeriodStore((s) => s.period);
  const sessionOpen = usePeriodStore((s) => s.sessionOpen);
  const studentIds = usePeriodStore((s) => s.studentIds);
  const currentIndex = usePeriodStore((s) => s.currentIndex);
  const marks = usePeriodStore((s) => s.marks);
  const paused = usePeriodStore((s) => s.paused);
  const markCurrent = usePeriodStore((s) => s.markCurrent);
  const goNext = usePeriodStore((s) => s.next);
  const goPrev = usePeriodStore((s) => s.prev);
  const togglePause = usePeriodStore((s) => s.togglePause);
  const closeSession = usePeriodStore((s) => s.closeSession);
  const showToast = useUiStore((s) => s.showToast);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!sessionOpen) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [sessionOpen]);

  useEffect(() => {
    if (!sessionOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSession();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sessionOpen, closeSession]);

  const students = useMemo(
    () => studentIds.map((id) => MOCK_ATTENDANCE_ROWS.find((r) => r.id === id)).filter((r) => r !== undefined),
    [studentIds]
  );
  const markedCount = Object.keys(marks).length;
  const currentStudent = students[currentIndex];

  const range = parseTimeRange(period?.time);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const progress = range ? Math.min(1, Math.max(0, (nowMinutes - range.start) / (range.end - range.start))) : 0;
  const remaining = range ? Math.max(0, range.end - nowMinutes) : 0;

  if (!period || !subjectName || !sessionOpen) return null;

  const handleMark = (status: AttendanceStatus) => {
    markCurrent(status);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm" aria-hidden onClick={closeSession} />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Period session"
        className="fixed inset-y-3.5 right-3.5 z-50 flex w-[min(1010px,60vw)] max-w-[calc(100vw-28px)] flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_24px_70px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.06)]"
      >
        <header className="flex flex-none items-center justify-between px-5 pt-4.5">
          <p className="flex items-center gap-2.5 text-base font-semibold text-text-primary">
            <BookmarkGlyph /> Period
          </p>
          <button
            type="button"
            aria-label="Close"
            onClick={closeSession}
            className="grid h-9.5 w-9.5 place-items-center rounded-full border border-border text-text-secondary transition-colors hover:bg-bg"
          >
            <XIcon size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-[22px] font-bold tracking-[-0.01em] text-primary">{subjectName}</h2>
            <span className="rounded-full border border-border px-3 py-1 text-[13px] font-medium text-text-secondary">
              {period.code === "DP" ? "Double Period" : "Single Period"}
            </span>
            <div className="ml-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={togglePause}
                className="inline-flex h-9.5 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-semibold text-primary transition-colors hover:bg-bg"
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
                {paused ? "Resume Class" : "Pause Class"}
              </button>
              <button
                type="button"
                onClick={closeSession}
                className="inline-flex h-9.5 items-center gap-2 rounded-full bg-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                <Square size={11} fill="currentColor" /> End Class
              </button>
            </div>
          </div>

          <button
            type="button"
            className="mt-3.5 flex w-full items-center justify-between gap-4 rounded-2xl border border-border px-4.5 py-3 text-left transition-colors hover:bg-[#FCFCFC]"
          >
            <span className="block text-base font-bold tracking-[-0.01em] text-text-primary">{period.topic}</span>
            <ChevronDown size={18} className="shrink-0 text-text-secondary" />
          </button>

          <div className="mt-2.5 rounded-2xl border border-border px-4.5 py-3.5">
            <p className="flex items-center gap-2.5 text-[15px] font-semibold text-text-primary">
              <ClockIcon size={17} /> {period.time}
            </p>
            <div className="relative mt-4">
              <div className="h-3 overflow-hidden rounded-full bg-primary-light">
                <span className="block h-full rounded-full bg-primary" style={{ width: `${progress * 100}%` }} />
              </div>
              <span
                className="absolute -top-1 h-5 w-0.5"
                style={{
                  left: `${progress * 100}%`,
                  backgroundImage: "repeating-linear-gradient(to bottom, var(--color-primary) 0 4px, transparent 4px 8px)",
                }}
              >
                <span className="absolute -left-1 -top-1 h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-primary" />
              </span>
            </div>
            <p className="mt-2.5 flex items-baseline justify-between">
              <span className="text-[13px] font-medium text-text-muted">Remain</span>
              <b className="text-[15px] font-bold text-text-primary">{remaining}min</b>
            </p>
          </div>

          <div className="mt-3.5 flex items-center justify-start gap-2.5">
            <button
              type="button"
              onClick={() => showToast({ type: "info", message: "Home quiz creation is coming soon" })}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              <PlusIcon size={13} /> Add Home quiz
            </button>
            <button
              type="button"
              onClick={() => showToast({ type: "info", message: "Class quiz creation is coming soon" })}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-accent-black px-3.5 text-[13px] font-semibold text-white transition-colors hover:opacity-90"
            >
              <PlusIcon size={13} /> Add Class quiz
            </button>
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2.5 text-base font-semibold text-text-primary">
              <UsersIcon size={19} /> Attendance
            </h3>
            <div className="inline-flex h-9.5 items-center gap-2.5 rounded-full border border-border py-0 pl-4 pr-1.5">
              <span className="text-[13px] font-medium text-text-secondary">Sort</span>
              <button
                type="button"
                className="inline-flex h-7 items-center gap-2 rounded-full bg-bg px-3 text-[13px] font-semibold text-text-primary"
              >
                Unmarked
                <ChevronDown size={14} className="text-text-secondary" />
              </button>
            </div>
          </div>

          <div className="my-4 h-px bg-border" />

          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-semibold text-text-primary">{students.length} students</p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              View all <ChevronRightIcon size={14} />
            </a>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="rounded-full bg-success-bg px-4 py-1.5 text-sm font-semibold text-success-text">
              {markedCount} marked
            </p>
            <div className="inline-flex overflow-hidden rounded-full border border-border">
              <button
                type="button"
                aria-label="Previous student"
                disabled={currentIndex === 0}
                onClick={goPrev}
                className="grid h-9 w-11 place-items-center text-text-secondary transition-colors hover:bg-bg disabled:opacity-40"
              >
                <ChevronLeftIcon size={16} />
              </button>
              <button
                type="button"
                aria-label="Next student"
                disabled={currentIndex === students.length - 1}
                onClick={goNext}
                className="grid h-9 w-11 place-items-center border-l border-border text-text-secondary transition-colors hover:bg-bg disabled:opacity-40"
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>

          {currentStudent ? (
            <StudentAttendanceCard
              student={currentStudent}
              mark={marks[currentStudent.id]}
              lastClassStatus={currentStudent.today}
              onMark={handleMark}
            />
          ) : (
            <p className="py-6 text-center text-sm text-text-secondary">No students on the roster.</p>
          )}
        </div>
      </section>
    </>
  );
}
