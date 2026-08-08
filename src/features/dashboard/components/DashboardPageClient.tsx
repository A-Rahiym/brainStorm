"use client";

import { HeadmasterOverview } from "@/features/dashboard/components/HeadmasterOverview";
import { TeacherOverview } from "@/features/dashboard/components/TeacherOverview";
import { Skeleton } from "@/components/ui";

export function DashboardPageClient({ initialRole }: { initialRole: "HEADMASTER" | "TEACHER" }) {
  if (initialRole === "HEADMASTER") return <HeadmasterOverview />;
  if (initialRole === "TEACHER") return <TeacherOverview />;
  return (
    <div className="grid grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="card" />
      ))}
    </div>
  );
}
