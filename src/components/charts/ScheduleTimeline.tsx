"use client";

import { WeekStrip } from "@/components/charts/WeekStrip";
import { TimelineRow } from "@/components/charts/schedule/TimelineRow";
import type { ScheduleBlock } from "@/features/dashboard/constants/timeline";
import { HEADMASTER_BLOCKS } from "@/features/dashboard/mock/timeline";
import type { SubjectPeriod } from "@/features/subjects/types";

export type { ScheduleBlock } from "@/features/dashboard/constants/timeline";

export function ScheduleTimeline({
  blocks,
  variant = "chip",
  afterStrip,
  onSelectPeriod,
}: {
  blocks?: ScheduleBlock[];
  variant?: "card" | "chip";
  afterStrip?: React.ReactNode;
  onSelectPeriod?: (input: {
    subjectName: string;
    period: SubjectPeriod;
    anchorEl: HTMLElement;
  }) => void;
}) {
  const timeline = blocks ?? HEADMASTER_BLOCKS;
  const isCard = variant === "card";

  return (
    <div>
      <div className="mb-4.5">
        <WeekStrip />
      </div>

      {afterStrip}

      <div className="relative">
        {timeline.map((block) => (
          <TimelineRow key={block.id} block={block} isCard={isCard} onSelectPeriod={onSelectPeriod} />
        ))}
      </div>
    </div>
  );
}
