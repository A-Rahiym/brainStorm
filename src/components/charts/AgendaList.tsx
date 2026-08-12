"use client";

import { Badge } from "@/components/ui";

export type AgendaItem = {
  id: string;
  time: string;
  day?: string;
  title: string;
  tag: "EVENT" | "MEETING";
  date: string;
};

export function AgendaList({ items }: { items: AgendaItem[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <div className="w-16 shrink-0 pt-4 text-[13px] font-semibold uppercase leading-[1.45] tracking-[0.03em] text-text-secondary">
            {item.time}
            {item.day && <b className="block font-bold uppercase text-primary">{item.day}</b>}
          </div>
          <div className="min-w-0 flex-1 rounded-xl border border-border px-4 py-3.5">
            <p className="mb-2.5 text-base font-semibold tracking-[-0.01em] text-text-primary">{item.title}</p>
            <Badge tone={item.tag === "EVENT" ? "warning" : "meeting"}>{item.tag}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
