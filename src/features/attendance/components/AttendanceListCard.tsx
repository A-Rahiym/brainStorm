"use client";

import { useMemo, useState } from "react";
import { ControlPill, SearchInput } from "@/components/ui";
import { UsersIcon } from "@/components/icons";
import { AttendanceTable } from "@/features/attendance/components/AttendanceTable";
import type { AttendanceRow } from "@/features/attendance/types";

export function AttendanceListCard({
  rows,
  classes,
  subjects,
}: {
  rows: AttendanceRow[];
  classes: string[];
  subjects: string[];
}) {
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (selectedClass !== "All" && r.className !== selectedClass) return false;
      if (q && !`${r.name} ${r.admissionNumber}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, selectedClass, query]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
          <UsersIcon size={20} />
          Attendance List
        </h2>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <ControlPill label="Class" variant="outline" size="md" value={selectedClass} onChange={setSelectedClass}>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </ControlPill>
          <ControlPill
            label="Subject"
            variant="outline"
            size="md"
            value={selectedSubject}
            onChange={setSelectedSubject}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </ControlPill>
          <SearchInput value={query} onChange={setQuery} placeholder="Search student" />
        </div>
      </div>
      <AttendanceTable rows={filtered} />
    </section>
  );
}
