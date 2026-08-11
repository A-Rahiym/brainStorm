import { ClipboardCheck, Hourglass, Layers } from "lucide-react";
import { StatCard } from "@/components/ui";
import { MetricCard } from "@/features/subjects/components/MetricCard";
import type { AssessmentsMetrics } from "@/features/assessments/types";

export function AssessmentsMetricsRow({ metrics }: { metrics: AssessmentsMetrics }) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Assessments overview">
      <StatCard
        primary
        label="Total Assignments"
        value={metrics.totalAssignments.value}
        footnote={<>{metrics.totalAssignments.foot}</>}
        icon={<Layers size={20} />}
        className="min-h-[218px]"
      />
      <StatCard
        label="Submitted"
        value={metrics.submitted.value}
        trend={metrics.submitted.trend}
        trendValue={metrics.submitted.trendValue}
        footnote={<>{metrics.submitted.foot}</>}
        icon={<ClipboardCheck size={20} />}
        className="min-h-[218px]"
      />
      <StatCard
        label="Pending Grading"
        value={metrics.pendingGrading.value}
        trend={metrics.pendingGrading.trend}
        trendValue={metrics.pendingGrading.trendValue}
        footnote={<>{metrics.pendingGrading.foot}</>}
        icon={<Hourglass size={20} />}
        className="min-h-[218px]"
      />
      <MetricCard metric={metrics.averageCompletion} icon={<ClipboardCheck size={20} />} />
    </section>
  );
}
