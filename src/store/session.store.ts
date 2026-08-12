import { create } from "zustand";

export type Role = "HEADMASTER" | "TEACHER";

export type PresenceStatus = "active" | "busy" | "unavailable" | "offline";

export type SessionState = {
  userId: string | null;
  role: Role | null;
  schoolId: string | null;
  teacherId?: string;
  headmasterId?: string;
  isAuthenticated: boolean;
  profileName: string | null;
  profileAvatar: string | null;
  status: PresenceStatus;
  setSession: (session: {
    userId: string;
    role: Role;
    schoolId: string | null;
    teacherId?: string;
    headmasterId?: string;
  }) => void;
  setProfile: (profile: { name: string; avatar: string | null }) => void;
  setStatus: (status: PresenceStatus) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  userId: null,
  role: null,
  schoolId: null,
  teacherId: undefined,
  headmasterId: undefined,
  isAuthenticated: false,
  profileName: null,
  profileAvatar: null,
  status: "active",
  setSession: ({ userId, role, schoolId, teacherId, headmasterId }) =>
    set({ userId, role, schoolId, teacherId, headmasterId, isAuthenticated: true }),
  setProfile: ({ name, avatar }) => set({ profileName: name, profileAvatar: avatar }),
  setStatus: (status) => set({ status }),
  clearSession: () =>
    set({
      userId: null,
      role: null,
      schoolId: null,
      teacherId: undefined,
      headmasterId: undefined,
      isAuthenticated: false,
      profileName: null,
      profileAvatar: null,
      status: "active",
    }),
}));
