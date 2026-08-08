import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useSessionStore } from "@/store/session.store";

function userScopedStorage() {
  const getKey = () => {
    const uid = useSessionStore.getState().userId;
    return uid ? `filters:${uid}` : "filters:anon";
  };
  return createJSONStorage(() => ({
    getItem: () => {
      if (typeof window === "undefined") return null;
      return window.localStorage.getItem(getKey());
    },
    setItem: (_name, value) => {
      if (typeof window !== "undefined") window.localStorage.setItem(getKey(), value);
    },
    removeItem: () => {
      if (typeof window !== "undefined") window.localStorage.removeItem(getKey());
    },
  }));
}

type FiltersState = {
  topStudentsBy: "all" | "class";
  topStudentsClassId: string | null;
  studentSearch: string;
  studentStatus: "ACTIVE" | "ALL" | "INACTIVE";
  setTopStudentsBy: (by: "all" | "class") => void;
  setTopStudentsClassId: (id: string | null) => void;
  setStudentSearch: (search: string) => void;
  setStudentStatus: (status: FiltersState["studentStatus"]) => void;
};

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      topStudentsBy: "all",
      topStudentsClassId: null,
      studentSearch: "",
      studentStatus: "ALL",
      setTopStudentsBy: (topStudentsBy) => set({ topStudentsBy }),
      setTopStudentsClassId: (topStudentsClassId) => set({ topStudentsClassId }),
      setStudentSearch: (studentSearch) => set({ studentSearch }),
      setStudentStatus: (studentStatus) => set({ studentStatus }),
    }),
    {
      name: "filters",
      storage: userScopedStorage(),
    }
  )
);
