"use client";

import { ErrorState, Skeleton } from "@/components/ui";
import { StudentsMetricsRow } from "@/features/students/components/StudentsMetricsRow";
import { StudentsListCard } from "@/features/students/components/StudentsListCard";
import { useTeacherStudents } from "@/features/students/hooks/queries/useTeacherStudents";

export function StudentsPageClient() {
  const { data, isLoading, isError, error, refetch } = useTeacherStudents();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[218px] w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <StudentsMetricsRow metrics={data.metrics} />
      <StudentsListCard
        students={data.students}
        classes={data.classes}
        subjects={data.subjects}
      />
    </div>
  );
}
