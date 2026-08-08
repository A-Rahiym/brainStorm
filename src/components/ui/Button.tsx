"use client";

import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "dark";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-surface text-text-primary border border-border hover:bg-bg",
  ghost: "bg-transparent text-text-secondary hover:bg-bg",
  dark: "bg-accent-black text-white hover:opacity-90",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm"
      } ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
