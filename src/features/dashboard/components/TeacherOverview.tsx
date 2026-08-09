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
      <div className="grid grid-cols-1 gap-9.5 sm:grid-cols-2 xl:grid-cols-4">
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
      <div className="grid grid-cols-1 gap-9.5 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <StatCard
          primary
          label="My students"
          value={formatNumber(stats.students)}
          iconSrc="/icons/people.svg"
          footnote="across assigned classes"
          iconClassName="!bg-surface"
        />
        <StatCard
          label="My classes"
          value={formatNumber(stats.classes)}
          iconSrc="/icons/Case.svg"
          footnote="this term"
          iconClassName="!bg-accent-black"
        />
        <StatCard
          label="My subjects"
          value={formatNumber(stats.subjects)}
          iconSrc="/icons/Book.svg"
          footnote="scheduled periods"
          iconClassName="!bg-accent-black"
        />
        <TermCountCard />
      </div>

      <div className="grid grid-cols-1 gap-4.5 xl:grid-cols-2">
        <CalendarAgendaCard agenda={agenda} />
        <AssignmentsCard assignments={assignments} />
      </div>

      <div className="grid grid-cols-1 gap-4.5 xl:grid-cols-2">
        <Card className="flex flex-col">
          <h3 className="mb-4 text-[15px] font-bold text-text-primary">Recent activity</h3>
          <ActivityFeed items={activities} />
        </Card>
        <TopStudentsCard students={topStudents} />
      </div>
    </div>
  );
}
