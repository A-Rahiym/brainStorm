"use client";

import { Card, Skeleton, StatCard, ErrorState } from "@/components/ui";
import { ActivityFeed } from "@/components/charts/ActivityFeed";
import { ChevronRightIcon, FileTextIcon, StudentsIcon, SubjectsIcon, TeachersIcon } from "@/components/icons";
import { formatNumber } from "@/lib/format";
import { useHeadmasterDashboard } from "@/features/dashboard/hooks/queries/useHeadmasterDashboard";
import { CalendarAgendaCard } from "@/features/dashboard/components/CalendarAgendaCard";
import { EnrollmentsCard } from "@/features/dashboard/components/EnrollmentsCard";
import { FeesCard } from "@/features/dashboard/components/FeesCard";
import { TopStudentsCard } from "@/features/dashboard/components/TopStudentsCard";
import { TermCountCard } from "@/features/dashboard/components/TermCountCard";

const JULY = new Date(2026, 6, 1);
const EVENT_DAYS = [new Date(2026, 6, 18), new Date(2026, 6, 23)];

export function HeadmasterOverview() {
  const { data, isLoading, isError, error, refetch } = useHeadmasterDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-[18px]">
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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-4.5">
        <StatCard
          primary
          label="Total students"
          value={formatNumber(stats.students)}
          icon={<StudentsIcon size={16} />}
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
          icon={<TeachersIcon size={16} />}
          iconClassName="!bg-accent-black !text-white"
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
          icon={<SubjectsIcon size={16} />}
          footnote={
            <>
              Active today: <b>24</b>
            </>
          }
        />
        <TermCountCard />
      </div>

      <div className="grid grid-cols-2 gap-4.5">
        <CalendarAgendaCard
          agenda={agenda}
          month={JULY}
          selected={new Date(2026, 6, 25)}
          eventDays={EVENT_DAYS}
        />
        <div className="flex flex-col gap-4.5">
          <FeesCard fees={fees} />
          <EnrollmentsCard enrollments={enrollments} />
          <TopStudentsCard students={topStudents} />
        </div>
      </div>

      <Card className="w-2/4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary">
            <FileTextIcon size={17} className="text-text-secondary" />
            Recent Activities
          </h3>
          <span className="flex items-center gap-0.5 text-[13px] font-bold text-primary">
            View all <ChevronRightIcon size={13} />
          </span>
        </div>
        <ActivityFeed items={activities} />
      </Card>
    </div>
  );
}
