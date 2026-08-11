"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchTodaySchedule } from "@/features/dashboard/request";
import { mapOccurrencesToBlocks } from "@/features/dashboard/utils/schedule";
import { TEACHER_BLOCKS } from "@/features/dashboard/mock/timeline";
import type { ScheduleBlock } from "@/features/dashboard/constants/timeline";

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mockBlocks(): ScheduleBlock[] {
  return TEACHER_BLOCKS.map((block) => ({
    ...block,
    events: block.events.map((event) => ({ ...event, isMock: true })),
  }));
}

export function useRightRailSchedule({ classId, date }: { classId?: string; date: Date }) {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<{ blocks: ScheduleBlock[]; isMock: boolean }>({
    queryKey: ["schedule", "today", userId ?? "anon", classId ?? "none", dateKey(date)],
    queryFn: async () => {
      const schedule = await fetchTodaySchedule({ classId, date });
      if (schedule.occurrences.length === 0) {
        return { blocks: mockBlocks(), isMock: true };
      }
      return { blocks: mapOccurrencesToBlocks(schedule.occurrences), isMock: false };
    },
  });
}
