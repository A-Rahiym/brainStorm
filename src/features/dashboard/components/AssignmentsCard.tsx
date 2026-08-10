"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { Button, Card, Badge, ControlPill } from "@/components/ui";
import { CalendarIcon, PlusIcon } from "@/components/icons";
import type { AssignmentItem } from "@/features/dashboard/types";

const classes = ["All", "SS1", "SS2", "SS3", "JSS 3"];
const TABS = ["Home quiz", "Submissions"] as const;
type Tab = (typeof TABS)[number];

export function AssignmentsCard({ assignments }: { assignments: AssignmentItem[] }) {
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [tab, setTab] = useState<Tab>("Home quiz");

  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
          <Layers size={20} className="text-text-primary" />
          Assignments
        </h3>
        <div className="flex items-center gap-3">
          <ControlPill
            label=""
            value={selectedClass}
            variant="outline"
            size="md"
            onChange={(v) => setSelectedClass(v)}
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </ControlPill>
          <Button variant="dark" className="h-10 rounded-full px-4.5">
            <PlusIcon size={16} /> Add
          </Button>
        </div>
      </div>

      <div className="mb-5 flex gap-7 border-b border-border" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px inline-flex items-center gap-2 border-b-2 px-0.5 pb-3 text-[15px] font-semibold transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t}
            {t === "Home quiz" && (
              <span className="text-[13px] font-semibold text-text-secondary">{assignments.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {assignments.map((item) => {
          const pct = item.total
            ? Math.min(100, Math.round(((item.submitted ?? 0) / item.total) * 100))
            : 0;
          return (
            <article key={item.id} className="rounded-xl border border-border p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="class">{item.className}</Badge>
                <Badge tone="neutral">{item.type ?? "Assignment"}</Badge>
                <Badge tone="neutral">{item.subject}</Badge>
                <Badge tone="due" className="ml-auto">
                  <CalendarIcon size={12} /> {item.dueLabel ?? "Due"}
                </Badge>
              </div>
              <h4 className="mb-3.5 text-base font-semibold tracking-[-0.01em] text-text-primary">{item.title}</h4>
              <div className="flex items-center gap-3">
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-primary-track"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-semibold text-text-primary">
                  {item.submitted ?? 0}
                  {item.total != null && <span className="text-text-muted"> / {item.total}</span>}
                </span>
              </div>
              <div className="mt-3.5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-text-secondary">
                {item.foot ?? "Snap & upload"}
                {item.footBadge && (
                  <Badge tone="outline" className="ml-auto normal-case tracking-normal">
                    {item.footBadge}
                  </Badge>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
