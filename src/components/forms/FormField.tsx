"use client";

import type { FieldError } from "react-hook-form";

export function FormField({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: FieldError;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-[13px] font-semibold text-text-secondary">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger-text">
          {error.message}
        </p>
      )}
    </div>
  );
}
