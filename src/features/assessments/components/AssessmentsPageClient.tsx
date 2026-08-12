"use client";

import { ErrorState, Skeleton } from "@/components/ui";
import { AssessmentsMetricsRow } from "@/features/assessments/components/AssessmentsMetricsRow";
import { AssignmentsCard } from "@/features/dashboard/components/AssignmentsCard";
import { useTeacherAssessments } from "@/features/assessments/hooks/queries/useTeacherAssessments";

export function AssessmentsPageClient() {
  const { data, isLoading, isError, error, refetch } = useTeacherAssessments();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[218px] w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4.5 xl:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <AssessmentsMetricsRow metrics={data.metrics} />
      <div className="grid grid-cols-1 gap-4.5 xl:grid-cols-2">
        <AssignmentsCard assignments={data.open} title="Open Assignments" className="h-140" />
        <AssignmentsCard assignments={data.closed} title="Closed Assignments" className="h-140" />
      </div>
    </div>
  );
}
