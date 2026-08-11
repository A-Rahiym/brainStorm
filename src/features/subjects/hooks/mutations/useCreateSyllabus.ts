"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSyllabus } from "@/features/subjects/request";
import type { TeacherSubject } from "@/features/subjects/types";

export function useCreateSyllabus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Pick<TeacherSubject, "name" | "code">): Promise<TeacherSubject> => {
      try {
        return await createSyllabus(input);
      } catch {
        return { id: `mock-subj-${Date.now()}`, name: input.name, code: input.code, students: 0, progress: 0 };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", "teacher"] });
    },
  });
}
