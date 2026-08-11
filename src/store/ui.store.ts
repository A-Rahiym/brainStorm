import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type UiState = {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  calendarMonth: Date;
  selectedDate: Date;
  toasts: Toast[];
  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  setCalendarMonth: (month: Date) => void;
  setSelectedDate: (date: Date) => void;
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
};

let toastSeq = 0;

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  calendarMonth: new Date(),
  selectedDate: new Date(),
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  setCalendarMonth: (month) => set({ calendarMonth: month }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  showToast: (toast) => {
    const id = `toast-${Date.now()}-${toastSeq++}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// export function useToast() {
//   return useUiStore((s) => ({ show: s.showToast, dismiss: s.dismissToast }));
// }
