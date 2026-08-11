"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClasses } from "@/features/dashboard/request";
import { RAIL_CLASS_TABS } from "@/features/dashboard/constants/constants";
import type { ClassOption } from "@/features/dashboard/types";

const MOCK_CLASSES: ClassOption[] = RAIL_CLASS_TABS.map((name, i) => ({ id: `mock-class-${i}`, name }));

export function useClasses() {
  return useQuery<ClassOption[]>({
    queryKey: ["classes", "all"],
    queryFn: async () => {
      const classes = await fetchClasses();
      return classes.length === 0 ? MOCK_CLASSES : classes;
    },
  });
}
