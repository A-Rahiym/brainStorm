"use client";

import { HeadmasterOverview } from "@/features/dashboard/components/HeadmasterOverview";
import { TeacherOverview } from "@/features/dashboard/components/TeacherOverview";
import { Skeleton } from "@/components/ui";

export function DashboardPageClient({ initialRole }: { initialRole: "HEADMASTER" | "TEACHER" }) {
  if (initialRole === "HEADMASTER") return <HeadmasterOverview />;
  if (initialRole === "TEACHER") return <TeacherOverview />;
  return (
    <div className="grid grid-cols-1 gap-9.5 sm:grid-cols-2 xl:grid-cols-4">
      {/* {Array.from({ length: 3 }).map((_, i) => ( */}
        <Skeleton  variant="card" />
      {/* ))} */}
    </div>
  );
}
