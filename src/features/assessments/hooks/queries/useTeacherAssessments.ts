"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchTeacherAssessments } from "@/features/assessments/request";
import { MOCK_TEACHER_ASSESSMENTS } from "@/features/assessments/mock/data";
import type { TeacherAssessments } from "@/features/assessments/types";

export function useTeacherAssessments() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<TeacherAssessments>({
    queryKey: ["assessments", "teacher", userId ?? "anon"],
    queryFn: async () => {
      const data = await fetchTeacherAssessments();
      if (data.open.length === 0 && data.closed.length === 0) {
        return MOCK_TEACHER_ASSESSMENTS;
      }
      return data;
    },
  });
}
