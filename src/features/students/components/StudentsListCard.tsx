"use client";

import { useMemo, useState } from "react";
import { ControlPill, SearchInput } from "@/components/ui";
import { StudentsIcon } from "@/components/icons";
import { StudentsTable } from "@/features/students/components/StudentsTable";
import type { StudentRow } from "@/features/students/types";

export function StudentsListCard({
  students,
  classes,
  subjects,
}: {
  students: StudentRow[];
  classes: string[];
  subjects: string[];
}) {
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (selectedClass !== "All" && s.className !== selectedClass) return false;
      if (q && !`${s.name} ${s.admissionNumber}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, selectedClass, query]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
          <StudentsIcon size={20} />
          Students List
        </h2>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <ControlPill label="Class" variant="outline" size="md" value={selectedClass} onChange={setSelectedClass}>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </ControlPill>
          <ControlPill label="Subject" variant="outline" size="md" value={selectedSubject} onChange={setSelectedSubject}>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </ControlPill>
          <SearchInput value={query} onChange={setQuery} placeholder="Search student" />
        </div>
      </div>
      <StudentsTable students={filtered} />
    </section>
  );
}
