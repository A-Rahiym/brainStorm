"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startPeriod } from "@/features/dashboard/request";
// import { useToast } from "@/store/ui.store";

export function useStartPeriod() {
  const queryClient = useQueryClient();
  // const { show } = useToast();

  return useMutation({
    mutationFn: async (input: { timetableEntryId: string; date?: Date; isMock?: boolean }) => {
      if (input.isMock !== false) return;
      await startPeriod(input);
    },
    onSuccess: () => {
      // show({ type: "success", message: "Period started" });
      queryClient.invalidateQueries({ queryKey: ["schedule", "today"] });
    },
    onError: (err: unknown) => {
      // show({ type: "error", message: err instanceof Error ? err.message : "Could not start period" });
    },
  });
}
