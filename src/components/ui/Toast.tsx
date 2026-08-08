"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { useUiStore } from "@/store/ui.store";

const toneStyles = {
  success: { bg: "bg-success-bg", text: "text-success-text", Icon: CheckCircle2 },
  error: { bg: "bg-schedule-red-bg", text: "text-schedule-red", Icon: AlertCircle },
  info: { bg: "bg-bg", text: "text-text-secondary", Icon: Info },
};

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const { bg, text, Icon } = toneStyles[toast.type];
        return (
          <button
            key={toast.id}
            onClick={() => dismiss(toast.id)}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-medium shadow-card ${bg} ${text}`}
          >
            <Icon size={16} className="mt-0.5 flex-shrink-0" />
            {toast.message}
          </button>
        );
      })}
    </div>
  );
}
