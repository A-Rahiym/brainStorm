"use client";

import { useState } from "react";
import { ControlPill, ErrorState, Skeleton } from "@/components/ui";
import { AssignmentsCard } from "@/features/dashboard/components/AssignmentsCard";
import { TopStudentsCard } from "@/features/dashboard/components/TopStudentsCard";
import { SubjectCard } from "@/features/subjects/components/SubjectCard";
import { CLASS_FILTERS } from "@/features/subjects/constants/constants";
import { useTeacherSubjects } from "@/features/subjects/hooks/queries/useTeacherSubjects";

export function SubjectsOverview() {
  const { data, isLoading, isError, error, refetch } = useTeacherSubjects();
  const [selectedClass, setSelectedClass] = useState(CLASS_FILTERS[0]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-52 w-89 flex-none" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const subjects = data.subjects;

  const assignments =
    selectedClass === "All"
      ? data.assignments
      : data.assignments.filter((a) => a.className === selectedClass);

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap gap-3" aria-label="My subjects">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-5">
        <span className="text-lg font-semibold text-text-primary">Filter</span>
        <ControlPill
          label="Class"
          value={selectedClass}
          variant="outline"
          size="md"
          onChange={setSelectedClass}
        >
          {CLASS_FILTERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </ControlPill>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
        <AssignmentsCard assignments={assignments} showClassFilter={true} />
        <TopStudentsCard students={data.topStudents} />
      </div>
    </div>
  );
}