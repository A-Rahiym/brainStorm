"use client";

export type TabItem = { key: string; label: string };

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-bg p-0.5" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
            active === tab.key
              ? "bg-surface text-text-primary shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
