import { BarChart3, CheckCircle2, Users } from "lucide-react";
import { StatCard } from "@/components/ui";
import { MetricCard } from "@/features/subjects/components/MetricCard";
import type { StudentMetrics } from "@/features/students/types";

export function StudentsMetricsRow({ metrics }: { metrics: StudentMetrics }) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-3" aria-label="Student metrics">
      <StatCard
        primary
        label="My Students"
        value={metrics.students.value}
        trend="up"
        trendValue={metrics.students.trend}
        footnote={<>{metrics.students.foot}</>}
        icon={<Users size={20} />}
        className="min-h-[218px]"
      />
      <MetricCard metric={metrics.performance} icon={<BarChart3 size={20} />} />
      <MetricCard metric={metrics.attendance} icon={<CheckCircle2 size={20} />} />
    </section>
  );
}
