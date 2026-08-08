"use client";

import { Badge } from "@/components/ui";

export type AgendaItem = {
  id: string;
  time: string;
  day?: string;
  title: string;
  tag: "EVENT" | "MEETING";
};

export function AgendaList({ items }: { items: AgendaItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3.5 border-t border-border px-0 py-3 first:border-t-0 first:pt-0">
          <div className="w-14 flex-shrink-0">
            <div className="text-[13px] font-bold text-text-primary">{item.time}</div>
            {item.day && (
              <div className="mt-0.5 text-[11px] font-bold uppercase text-primary">{item.day}</div>
            )}
          </div>
          <div className="min-w-0">
            <div className="mb-1.5 text-sm font-semibold text-text-primary">{item.title}</div>
            <Badge tone={item.tag === "EVENT" ? "warning" : "meeting"}>{item.tag}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
