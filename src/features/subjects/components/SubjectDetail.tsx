"use client";

import { BarChart3, CheckCircle2 } from "lucide-react";
import { ErrorState, Skeleton } from "@/components/ui";
import { AssignmentsCard } from "@/features/dashboard/components/AssignmentsCard";
import { TopStudentsCard } from "@/features/dashboard/components/TopStudentsCard";
import { MetricCard } from "@/features/subjects/components/MetricCard";
import { SubjectCalendarCard } from "@/features/subjects/components/SubjectCalendarCard";
import { SubjectSummaryCard } from "@/features/subjects/components/SubjectSummaryCard";
import { useSubjectDetail } from "@/features/subjects/hooks/queries/useSubjectDetail";
import { usePeriodStore } from "@/store/period.store";

const ASSESSMENT_TABS = ["Home quiz", "CA"] as const;

export function SubjectDetail({ subjectId }: { subjectId: string }) {
  const { data, isLoading, isError, error, refetch } = useSubjectDetail(subjectId);
  const openPeriod = usePeriodStore((s) => s.openPeriod);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Skeleton className="h-54.5 w-full" />
          <Skeleton className="h-54.5 w-full" />
          <Skeleton className="h-54.5 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  const [performance, attendance] = data.metrics;

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3" aria-label="Subject metrics">
        <SubjectSummaryCard subject={data.subject} />
        <MetricCard metric={performance} icon={<BarChart3 size={20} />} />
        <MetricCard metric={attendance} icon={<CheckCircle2 size={20} />} />
      </section>

      <SubjectCalendarCard
        subjectName={data.subject.name}
        classes={data.classes}
        onStartPeriod={(period, anchorEl) => openPeriod({ subjectName: data.subject.name, period, anchorEl })}
        eventDays={data.calendarEventDays}
        initialSelected={data.calendarEventDays[data.calendarEventDays.length - 1]}
      />

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
        <AssignmentsCard
          title="Assessments"
          assignments={data.assignments}
          showClassFilter={false}
          tabs={ASSESSMENT_TABS}
        />
        <TopStudentsCard students={data.topStudents} />
      </div>
    </div>
  );
}
