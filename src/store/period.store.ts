import { create } from "zustand";
import type { SubjectPeriod } from "@/features/subjects/types";

export type PeriodOverlay = {
  subjectName: string | null;
  period: SubjectPeriod | null;
  anchorRect: DOMRect | null;
  openPeriod: (input: { subjectName: string; period: SubjectPeriod; anchorRect: DOMRect }) => void;
  closePeriod: () => void;
};

export const usePeriodStore = create<PeriodOverlay>((set) => ({
  subjectName: null,
  period: null,
  anchorRect: null,
  openPeriod: ({ subjectName, period, anchorRect }) => set({ subjectName, period, anchorRect }),
  closePeriod: () => set({ subjectName: null, period: null, anchorRect: null }),
}));
