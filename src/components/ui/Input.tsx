"use client";

import { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", invalid = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-[10px] border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-2 focus:outline-offset-0 focus:outline-primary ${
        invalid ? "border-danger-text" : "border-border"
      } ${className}`}
      {...props}
    />
  );
});
