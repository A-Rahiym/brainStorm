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

const kindStyles: Record<ActivityKind, { Icon: React.ComponentType<{ size?: number }>; className: string }> = {
  document: { Icon: FileText, className: "bg-success-bg text-success-text" },
  payment: { Icon: Wallet, className: "bg-blue-100 text-blue-600" },
  enrollment: { Icon: UserPlus, className: "bg-[#EDE4FE] text-[#7C3AED]" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div>
      {items.map((item) => {
        const { Icon, className } = kindStyles[item.kind];
        return (
          <div key={item.id} className="flex items-start gap-3.5 border-t border-border py-3.5 first:border-t-0 first:pt-0">
            <span className={`flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full ${className}`}>
              <Icon size={15} />
            </span>
            <div>
              <div className="text-sm font-semibold text-text-primary">{item.description}</div>
              <div className="mt-0.5 text-xs text-text-muted">{formatRelativeTime(item.createdAt)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
