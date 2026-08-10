"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchTeacherSubjects } from "@/features/subjects/request";
import { CLASS_FILTERS } from "@/features/subjects/constants/constants";
import { MOCK_ASSIGNMENTS, MOCK_SUBJECTS, MOCK_TOP_STUDENTS } from "@/features/subjects/mock/data";
import type { TeacherSubjects } from "@/features/subjects/types";

export function useTeacherSubjects() {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<TeacherSubjects>({
    queryKey: ["subjects", "teacher", userId ?? "anon"],
    queryFn: async () => {
      const data = await fetchTeacherSubjects();
      if (data.subjects.length === 0) {
        return {
          subjects: MOCK_SUBJECTS,
          assignments: MOCK_ASSIGNMENTS,
          topStudents: MOCK_TOP_STUDENTS,
          classes: CLASS_FILTERS,
        };
      }
      return data;
    },
  });
}
