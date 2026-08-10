"use client";

import { SearchIcon } from "@/components/icons";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label
      className={`inline-flex h-12 w-full min-w-0 items-center gap-3 rounded-full bg-bg px-[18px] text-text-muted lg:w-auto lg:min-w-[260px] ${className}`}
    >
      <SearchIcon size={18} className="flex-none" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
      />
    </label>
  );
}
