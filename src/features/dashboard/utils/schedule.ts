import type { ScheduleBlock } from "@/features/dashboard/constants/timeline";
import type { ScheduleOccurrence } from "@/features/dashboard/types";

export function mapOccurrencesToBlocks(occurrences: ScheduleOccurrence[]): ScheduleBlock[] {
  const byStart = new Map<string, ScheduleOccurrence[]>();
  for (const occ of occurrences) {
    const bucket = byStart.get(occ.startTime) ?? [];
    bucket.push(occ);
    byStart.set(occ.startTime, bucket);
  }

  return [...byStart.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timeLabel, occs]) => ({
      id: timeLabel,
      timeLabel,
      now: occs.some((o) => o.status === "live"),
      events: occs.map((o) => ({
        id: o.id,
        name: o.subject.name,
        description: o.class.name,
        time: `${o.startTime} - ${o.endTime}`,
        person: o.isMine ? "Me" : o.teacher.name,
        tone: o.isMine ? "pink" : "red",
        isMine: o.isMine,
        live: o.status === "live",
        isMock: false,
      })),
    }));
}
