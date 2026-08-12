"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchTeacherStudents } from "@/features/students/request";
import { STUDENT_SUBJECT_FILTERS } from "@/features/students/constants/constants";
import { MOCK_STUDENT_METRICS, MOCK_STUDENT_ROWS } from "@/features/students/mock/data";
import type { TeacherStudents } from "@/features/students/types";

export function useTeacherStudents() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<TeacherStudents>({
    queryKey: ["students", "teacher", userId ?? "anon"],
    queryFn: async () => {
      const data = await fetchTeacherStudents();
      if (data.students.length === 0) {
        return {
          metrics: MOCK_STUDENT_METRICS,
          students: MOCK_STUDENT_ROWS,
          classes: ["All", ...new Set(MOCK_STUDENT_ROWS.map((s) => s.className))],
          subjects: STUDENT_SUBJECT_FILTERS,
        };
      }
      return data;
    },
  });
}
