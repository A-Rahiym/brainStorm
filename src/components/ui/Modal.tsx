"use client";

import { X } from "lucide-react";
import { useUiStore } from "@/store/ui.store";

export function Modal({
  id,
  title,
  children,
  onClose,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const open = activeModal === id;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => {
        closeModal();
        onClose?.();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            aria-label="Close"
            className="rounded-[10px] p-1 text-text-muted hover:bg-bg"
            onClick={() => {
              closeModal();
              onClose?.();
            }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
