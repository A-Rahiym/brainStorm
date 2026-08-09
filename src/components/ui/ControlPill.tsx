"use client";

import { ChevronDownIcon } from "@/components/icons";

export type ControlPillOption = { value: string; label: string };
export type ControlPillVariant = "default" | "outline";

const containerStyles: Record<ControlPillVariant, string> = {
  default: "bg-bg",
  outline: "bg-surface border border-border",
};

const triggerStyles: Record<ControlPillVariant, string> = {
  default: "bg-surface hover:bg-bg",
  outline: "bg-bg hover:bg-surface",
};

const sizes: Record<"sm" | "md", { trigger: string; icon: number }> = {
  sm: { trigger: "px-3 py-1.5 text-md", icon: 16 },
  md: { trigger: "px-3.5 py-2 text-sm", icon: 18 },
};

export function ControlPill({
  label,
  value,
  options,
  children,
  onChange,
  onClick,
  variant = "default",
  size = "sm",
  disabled,
  className = "",
  containerClassName = "",
}: {
  label?: string;
  value?: string;
  options?: ControlPillOption[];
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  onClick?: () => void;
  variant?: ControlPillVariant;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}) {
  const isSelect = typeof onChange === "function";
  const sizeStyles = sizes[size];

  return (
    <div
      className={`flex items-center gap-2.5 rounded-full px-2 py-1 text-md font-semibold ${containerStyles[variant]} ${containerClassName}`}
    >
      {label && <span className="text-text-secondary">{label}</span>}
      {isSelect ? (
        <div
          className={`relative flex items-center rounded-full ${triggerStyles[variant]} ${sizeStyles.trigger}`}
        >
          <select
            aria-label={label}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`appearance-none bg-transparent pr-6 font-semibold text-text-primary focus:outline-none disabled:cursor-not-allowed ${className}`}
          >
            {options
              ? options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDownIcon
            size={sizeStyles.icon}
            className="pointer-events-none absolute right-3 text-text-muted"
          />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={`flex items-center gap-1 rounded-full font-semibold text-text-primary disabled:cursor-not-allowed ${triggerStyles[variant]} ${sizeStyles.trigger} ${className}`}
        >
          <span>{value}</span>
          <ChevronDownIcon size={sizeStyles.icon} className="text-text-muted" />
        </button>
      )}
    </div>
  );
}
