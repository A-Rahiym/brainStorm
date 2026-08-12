import type { ScheduleBlock } from "@/features/dashboard/constants/timeline";
import type { SubjectPeriod } from "@/features/subjects/types";
import { ScheduleEventCard } from "./ScheduleEventCard";
import { ScheduleEventChip } from "./ScheduleEventChip";
import { BreakRow } from "./BreakRow";

export function TimelineRow({
  block,
  isCard,
  onSelectPeriod,
}: {
  block: ScheduleBlock;
  isCard: boolean;
  onSelectPeriod?: (input: {
    subjectName: string;
    period: SubjectPeriod;
    anchorEl: HTMLElement;
  }) => void;
}) {
  return (
    <div className="flex min-h-11 gap-2">
      <span
        className={`w-13 shrink-0 pt-0.5 text-xs ${
          isCard ? "font-medium text-text-muted" : "font-semibold text-text-secondary"
        }`}
      >
        {block.timeLabel}
      </span>
      <div className="relative flex-1 border-t border-border">
        {block.events.map((event) =>
          isCard ? (
            <ScheduleEventCard key={event.id} event={event} onSelectPeriod={onSelectPeriod} />
          ) : (
            <ScheduleEventChip key={event.id} event={event} />
          )
        )}
        {block.break && <BreakRow time={block.break} isCard={isCard} />}
        {block.now && isCard && (
          <span
            aria-hidden
            className="absolute -left-3.5 top-1 h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-primary"
          />
        )}
      </div>
    </div>
  );
}
