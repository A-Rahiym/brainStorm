import { Card, Badge, ControlPill } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { AssignmentItem } from "@/features/dashboard/types";

import { useState } from "react";

const statusTone: Record<AssignmentItem["status"], "success" | "warning" | "neutral"> = {
  OPEN: "success",
  CLOSED: "neutral",
};

const classes = ["Math", "Science", "History", "English", "Art", "Music", "Physical Education", "Computer Science"];

export function AssignmentsCard({ assignments }: { assignments: AssignmentItem[] }) {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]);

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-text-primary">Assignments</h3>
        <ControlPill label="" value={selectedClass} onChange={(v) => setSelectedClass(v)}>
          {classes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </ControlPill>
      </div>
      <div className="space-y-4">
        {assignments.map((item) => (
          <div key={item.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">{item.title}</p>
                <p className="mt-0.5 text-xs font-semibold text-text-secondary">
                  {item.subject} · {item.className}
                </p>
              </div>
              <Badge tone={statusTone[item.status]}>{item.status}</Badge>
            </div>
            <p className="mt-1.5 text-xs text-text-muted">Due {formatDate(item.dueDate)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
