import { CheckCircle2, UserX, Users } from "lucide-react";
import { StatCard } from "@/components/ui";
import { MetricCard } from "@/features/subjects/components/MetricCard";
import type { AttendanceMetrics } from "@/features/attendance/types";

export function AttendanceMetricsRow({ metrics }: { metrics: AttendanceMetrics }) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Attendance overview">
      <StatCard
        primary
        label="Total Students"
        value={metrics.totalStudents.value}
        footnote={<>{metrics.totalStudents.foot}</>}
        icon={<Users size={20} />}
        className="min-h-[218px]"
      />
      <StatCard
        label="Present Today"
        value={metrics.presentToday.value}
        trend={metrics.presentToday.trend}
        trendValue={metrics.presentToday.trendValue}
        footnote={<>{metrics.presentToday.foot}</>}
        icon={<CheckCircle2 size={20} />}
        className="min-h-[218px]"
      />
      <StatCard
        label="Absent Today"
        value={metrics.absentToday.value}
        trend={metrics.absentToday.trend}
        trendValue={metrics.absentToday.trendValue}
        footnote={<>{metrics.absentToday.foot}</>}
        icon={<UserX size={20} />}
        className="min-h-[218px]"
      />
      <MetricCard metric={metrics.averageRate} icon={<CheckCircle2 size={20} />} />
    </section>
  );
}
