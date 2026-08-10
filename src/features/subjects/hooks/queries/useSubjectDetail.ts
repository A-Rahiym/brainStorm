"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchSubjectDetail } from "@/features/subjects/request";
import { mockSubjectDetail } from "@/features/subjects/mock/subject-detail";
import type { SubjectDetail } from "@/features/subjects/types";

export function useSubjectDetail(subjectId: string) {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<SubjectDetail>({
    queryKey: ["subjects", "teacher", userId ?? "anon", subjectId],
    queryFn: async () => {
      const data = await fetchSubjectDetail(subjectId);
      if (!data?.subject) return mockSubjectDetail(subjectId);
      return data;
    },
  });
}
