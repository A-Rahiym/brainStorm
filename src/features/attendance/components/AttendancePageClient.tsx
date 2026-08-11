"use client";

import { ErrorState, Skeleton } from "@/components/ui";
import { AttendanceMetricsRow } from "@/features/attendance/components/AttendanceMetricsRow";
import { AttendanceListCard } from "@/features/attendance/components/AttendanceListCard";
import { useTeacherAttendance } from "@/features/attendance/hooks/queries/useTeacherAttendance";

export function AttendancePageClient() {
  const { data, isLoading, isError, error, refetch } = useTeacherAttendance();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
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
      <AttendanceMetricsRow metrics={data.metrics} />
      <AttendanceListCard rows={data.rows} classes={data.classes} subjects={data.subjects} />
    </div>
  );
}
