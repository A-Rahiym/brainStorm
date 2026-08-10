"use client";

import { FileText, UserPlus, Wallet } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

type ActivityKind = "document" | "payment" | "enrollment";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  description: string;
  createdAt: string | Date;
};

const kindIcons: Record<ActivityKind, React.ComponentType<{ size?: number }>> = {
  document: FileText,
  payment: Wallet,
  enrollment: UserPlus,
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div>
      {items.map((item, index) => {
        const Icon = kindIcons[item.kind];
        const isLast = index === items.length - 1;
        return (
          <div
            key={item.id}
            className={`grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3.5 border-b border-border py-4 ${
              isLast ? "border-b-0 pb-0.5" : ""
            }`}
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F6EE] text-[#2F7A55]">
              <Icon size={19} />
            </span>
            <div>
              <p className="text-[15px] font-medium tracking-[-0.01em] text-text-primary">{item.description}</p>
              <p className="mt-0.5 text-[13px] text-text-secondary">{formatRelativeTime(item.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
