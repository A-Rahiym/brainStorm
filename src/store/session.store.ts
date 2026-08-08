import { create } from "zustand";

export type Role = "HEADMASTER" | "TEACHER";

export type SessionState = {
  userId: string | null;
  role: Role | null;
  schoolId: string | null;
  teacherId?: string;
  headmasterId?: string;
  isAuthenticated: boolean;
  setSession: (session: {
    userId: string;
    role: Role;
    schoolId: string | null;
    teacherId?: string;
    headmasterId?: string;
  }) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  role: null,
  schoolId: null,
  teacherId: undefined,
  headmasterId: undefined,
  isAuthenticated: false,
  setSession: ({ userId, role, schoolId, teacherId, headmasterId }) =>
    set({ userId, role, schoolId, teacherId, headmasterId, isAuthenticated: true }),
  clearSession: () =>
    set({
      userId: null,
      role: null,
      schoolId: null,
      teacherId: undefined,
      headmasterId: undefined,
      isAuthenticated: false,
    }),
}));
