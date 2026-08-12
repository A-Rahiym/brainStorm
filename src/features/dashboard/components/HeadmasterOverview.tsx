"use client";

import { Card, Skeleton, StatCard, ErrorState } from "@/components/ui";
import { ActivityFeed } from "@/components/charts/ActivityFeed";
import { ChevronRightIcon, FileTextIcon } from "@/components/icons";
import { formatNumber } from "@/lib/format";
import { useHeadmasterDashboard } from "@/features/dashboard/hooks/queries/useHeadmasterDashboard";
import { CalendarAgendaCard } from "@/features/dashboard/components/CalendarAgendaCard";
import { EnrollmentsCard } from "@/features/dashboard/components/EnrollmentsCard";
import { FeesCard } from "@/features/dashboard/components/FeesCard";
import { TopStudentsCard } from "@/features/dashboard/components/TopStudentsCard";
import { TermCountCard } from "@/features/dashboard/components/TermCountCard";

export function HeadmasterOverview() {
  const { data, isLoading, isError, error, refetch } = useHeadmasterDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const { stats, fees, enrollments, agenda, topStudents, activities } = data;

  const eventDays = agenda.map((a) => new Date(a.date));
  const calendarMonth = eventDays[0] ?? new Date();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <StatCard
          primary
          label="Total students"
          value={formatNumber(stats.students)}
          iconSrc="/icons/people.svg"
          iconClassName="!bg-surface"
          trend="up"
          trendValue="15%"
          footnote={
            <>
              Last month: <b>4,150</b>
            </>
          }
        />
        <StatCard
          label="Teachers"
          value={formatNumber(stats.teachers)}
          iconSrc="/icons/Case.svg"
          iconClassName="!bg-accent-black"
          trend="down"
          trendValue="3%"
          footnote={
            <>
              Active today: <b>29</b>
            </>
          }
        />
        <StatCard
          label="Subjects"
          value={formatNumber(stats.subjects)}
          iconSrc="/icons/Book.svg"
          iconClassName="!bg-accent-black"
          footnote={
            <>
              Active today: <b>24</b>
            </>
          }
        />
        <TermCountCard />
      </div>

      <div className="grid grid-cols-1 gap-4.5 xl:grid-cols-2">
        <FeesCard fees={fees} />
        <EnrollmentsCard enrollments={enrollments} />
      </div>

      <CalendarAgendaCard
        agenda={agenda}
        month={calendarMonth}
        selected={eventDays[0]}
        eventDays={eventDays}
      />

      <div className="grid grid-cols-1 gap-4.5 xl:grid-cols-2">
        <Card className="flex h-140 min-h-0 w-full flex-col">
          <div className="mb-4 flex flex-none items-center justify-between">
            <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary">
              <FileTextIcon size={17} className="text-text-secondary" />
              Recent Activities
            </h3>
            <span className="flex items-center gap-0.5 text-[13px] font-bold text-primary">
              View all <ChevronRightIcon size={13} />
            </span>
          </div>
          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
            <ActivityFeed items={activities} />
          </div>
        </Card>
        <TopStudentsCard students={topStudents} className="h-140" />
      </div>
    </div>
  );
}