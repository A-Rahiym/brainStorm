"use client";

import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import { fetchSubjectDetail } from "@/features/subjects/request";
import type { SubjectDetail } from "@/features/subjects/types";

export function useSubjectDetail(subjectId: string) {
  const userId = useSessionStore((s) => s.userId);

  return useQuery<SubjectDetail>({
    queryKey: ["subjects", "teacher", userId ?? "anon", subjectId],
    queryFn: () => fetchSubjectDetail(subjectId),
  });
}
