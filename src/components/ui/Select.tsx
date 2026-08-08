"use client";

import { forwardRef } from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", invalid = false, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={`h-10 w-full rounded-[10px] border bg-surface px-3 text-sm text-text-primary focus:outline-2 focus:outline-offset-0 focus:outline-primary ${
        invalid ? "border-danger-text" : "border-border"
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
