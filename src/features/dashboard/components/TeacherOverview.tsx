"use client";

import { Card, Skeleton, StatCard, ErrorState } from "@/components/ui";
import { ActivityFeed } from "@/components/charts/ActivityFeed";
import { formatNumber } from "@/lib/format";
import { useTeacherDashboard } from "@/features/dashboard/hooks/queries/useTeacherDashboard";
import { AssignmentsCard } from "@/features/dashboard/components/AssignmentsCard";
import { CalendarAgendaCard } from "@/features/dashboard/components/CalendarAgendaCard";
import { TopStudentsCard } from "@/features/dashboard/components/TopStudentsCard";
import { TermCountCard } from "@/features/dashboard/components/TermCountCard";

export function TeacherOverview() {
  const { data, isLoading, isError, error, refetch } = useTeacherDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const { stats, assignments, agenda, topStudents, activities } = data;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <StatCard
          primary
          label="My students"
          value={formatNumber(stats.students)}
          iconSrc="/icons/people.svg"
          footnote="across assigned classes"
        />
        <StatCard
          label="My classes"
          value={formatNumber(stats.classes)}
          iconSrc="/icons/Case.svg"
          footnote="this term"
        />
        <StatCard
          label="My subjects"
          value={formatNumber(stats.subjects)}
          iconSrc="/icons/Book.svg"
          footnote="scheduled periods"
        />
        <TermCountCard />
      </div>

      <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <AssignmentsCard assignments={assignments} />
        <CalendarAgendaCard agenda={agenda} />
      </div>

      <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
        <TopStudentsCard students={topStudents} />
        <Card className="flex flex-col">
          <h3 className="mb-4 text-[15px] font-bold text-text-primary">Recent activity</h3>
          <ActivityFeed items={activities} />
        </Card>
      </div>
    </div>
  );
}
