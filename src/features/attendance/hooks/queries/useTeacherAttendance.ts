"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchTeacherAttendance } from "@/features/attendance/request";
import {
  ATTENDANCE_CLASS_FILTERS,
  ATTENDANCE_SUBJECT_FILTERS,
} from "@/features/attendance/constants/constants";
import {
  MOCK_ATTENDANCE_META,
  MOCK_ATTENDANCE_METRICS,
  MOCK_ATTENDANCE_ROWS,
} from "@/features/attendance/mock/data";


import type { TeacherAttendance } from "@/features/attendance/types";
export function useTeacherAttendance() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<TeacherAttendance>({
    queryKey: ["attendance", "teacher", userId ?? "anon"],
    queryFn: async () => {
      const data = await fetchTeacherAttendance();
      if (data.rows.length === 0) {
        return {
          meta: MOCK_ATTENDANCE_META,
          metrics: MOCK_ATTENDANCE_METRICS,
          rows: MOCK_ATTENDANCE_ROWS,
          classes: ATTENDANCE_CLASS_FILTERS,
          subjects: ATTENDANCE_SUBJECT_FILTERS,
        };
      }
      return data;
    },
  });
}
