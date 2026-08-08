"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Card, DonutChart } from "@/components/ui";
import type { EnrollmentSummary } from "@/features/dashboard/types";

type View = "gender" | "class";

export function EnrollmentsCard({ enrollments }: { enrollments: EnrollmentSummary }) {
  const [view, setView] = useState<View>("gender");

  const girlsPct = enrollments.total > 0 ? Math.round((enrollments.girls / enrollments.total) * 100) : 0;
  const boysPct = 100 - girlsPct;

  const donutData = [
    { key: "girls", label: "Girls", value: enrollments.girls, color: "#9F1244" },
    { key: "boys", label: "Boys", value: enrollments.boys, color: "#FCE7EF" },
  ];

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary">
          <Pencil size={16} className="text-text-secondary" />
          Enrollments
        </h3>
        <div className="flex rounded-full bg-bg p-1">
          {(["class", "gender"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`rounded-full px-3 py-1 text-md font-semibold ${
                view === key ? "bg-surface text-text-primary" : "text-text-secondary"
              }`}
            >
              {key === "class" ? "Class" : "Gender"}
            </button>
          ))}
        </div>
      </div>

      {view === "gender" ? (
        <div className="flex flex-col items-center gap-6 xl:flex-row xl:justify-start xl:gap-8">
          <DonutChart data={donutData} centerValue={String(enrollments.total)} centerLabel="TOTAL" height={190} />
          <div className="flex flex-col gap-3.5 text-md">
            <span className="flex items-center gap-2.5">
              <span className="h-4 w-4 rounded-md bg-primary" />
              {enrollments.girls} girls
              <span className="ml-auto font-medium text-text-muted">{girlsPct}%</span>
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-4 w-4 rounded-md bg-primary-light" />
              {enrollments.boys} boys
              <span className="ml-auto font-medium text-text-muted">{boysPct}%</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {enrollments.byClass.map((row) => {
            const pct = enrollments.total > 0 ? Math.round((row.students / enrollments.total) * 100) : 0;
            return (
              <div key={row.className} className="flex items-center gap-2.5 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                <span className="flex-1 font-semibold text-text-primary">{row.className}</span>
                <span className="text-text-secondary">{row.students} students</span>
                <span className="w-10 text-right font-bold text-text-primary">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
