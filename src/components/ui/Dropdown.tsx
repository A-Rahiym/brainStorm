"use client";

import { ChevronDown } from "lucide-react";

export function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-2 text-sm">
      <span className="font-medium text-text-secondary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-1 font-bold text-text-primary focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="text-text-muted" />
    </label>
  );
}
