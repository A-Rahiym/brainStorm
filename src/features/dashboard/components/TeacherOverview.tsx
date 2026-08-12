"use client";

import { Card, Skeleton, StatCard, ErrorState } from "@/components/ui";
import { ActivityFeed } from "@/components/charts/ActivityFeed";
import { ChevronRightIcon, FileTextIcon } from "@/components/icons";
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          primary
          label="My students"
          value={formatNumber(stats.students)}
          iconSrc="/icons/people.svg"
          footnote="across assigned classes"
          iconClassName="!bg-surface"
          trend="up"
          trendValue="15%"
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

      <div className="flex flex-col gap-3">
        <CalendarAgendaCard agenda={agenda} />
        <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
          <Card className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
                <FileTextIcon size={20} className="text-text-primary" />
                Recent Activities
              </h3>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                View all <ChevronRightIcon size={14} />
              </span>
            </div>
            <ActivityFeed items={activities} />
          </Card>
          <AssignmentsCard assignments={assignments} />
        </div>
      </div>
    </div>
  );
}
