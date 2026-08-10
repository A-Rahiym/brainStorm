"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSyllabus } from "@/features/subjects/api";

export function useCreateSyllabus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSyllabus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", "teacher"] });
    },
  });
}
