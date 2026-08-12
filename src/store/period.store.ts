import { create } from "zustand";
import type { AttendanceStatus } from "@/features/attendance/types";
import type { SubjectPeriod } from "@/features/subjects/types";

export type PeriodStoreState = {
  subjectName: string | null;
  period: SubjectPeriod | null;
  anchorEl: HTMLElement | null;
  openPeriod: (input: { subjectName: string; period: SubjectPeriod; anchorEl: HTMLElement }) => void;
  closePeriod: () => void;

  sessionOpen: boolean;
  studentIds: string[];
  currentIndex: number;
  marks: Record<string, AttendanceStatus>;
  paused: boolean;
  openSession: (input: { studentIds: string[] }) => void;
  closeSession: () => void;
  markCurrent: (status: AttendanceStatus) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  togglePause: () => void;
};

export const usePeriodStore = create<PeriodStoreState>((set, get) => ({
  subjectName: null,
  period: null,
  anchorEl: null,
  openPeriod: ({ subjectName, period, anchorEl }) => set({ subjectName, period, anchorEl }),
  closePeriod: () => set({ subjectName: null, period: null, anchorEl: null }),

  sessionOpen: false,
  studentIds: [],
  currentIndex: 0,
  marks: {},
  paused: false,
  openSession: ({ studentIds }) =>
    set({ sessionOpen: true, studentIds, currentIndex: 0, marks: {}, paused: false }),
  closeSession: () =>
    set({
      subjectName: null,
      period: null,
      anchorEl: null,
      sessionOpen: false,
      studentIds: [],
      currentIndex: 0,
      marks: {},
      paused: false,
    }),
  markCurrent: (status) => {
    const { studentIds, currentIndex, marks } = get();
    const studentId = studentIds[currentIndex];
    if (!studentId) return;
    const nextMarks = { ...marks, [studentId]: status };
    const nextIndex = currentIndex < studentIds.length - 1 ? currentIndex + 1 : currentIndex;
    set({ marks: nextMarks, currentIndex: nextIndex });
  },
  goTo: (index) =>
    set((s) => ({ currentIndex: Math.min(Math.max(index, 0), Math.max(s.studentIds.length - 1, 0)) })),
  next: () => set((s) => ({ currentIndex: Math.min(s.currentIndex + 1, Math.max(s.studentIds.length - 1, 0)) })),
  prev: () => set((s) => ({ currentIndex: Math.max(s.currentIndex - 1, 0) })),
  togglePause: () => set((s) => ({ paused: !s.paused })),
}));
