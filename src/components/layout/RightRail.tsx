"use client";

import { PlusIcon } from "@/components/icons";
import { Avatar} from "@/components/ui";
import { IconButton } from "@/components/ui/IconButton";
import { ScheduleTimeline } from "@/components/charts/ScheduleTimeline";
import { useSessionStore } from "@/store/session.store";
import { ChevronRight } from "lucide-react";



export function RightRail() {
  const role = useSessionStore((s) => s.role);

  const profileName = role === "HEADMASTER" ? "Bello Salis Adam" : "Grace Okon";
  const roleLabel = role === "HEADMASTER" ? "Headmaster" : "Teacher";

  return (
    <aside className="hidden w-95 bg-white shrink-0 border-l border-border px-4 pb-7 pt-8 lg:block">
      <div className="mb-6 flex flex-col items-center border-b border-border pb-6 text-center">
        <div className="flex item-center justify-between mb-6  w-full">
          <div className="flex gap-3">
            <IconButton
              icon="/icons/Bell.svg"
              label="Notifications"
              showLabel={false}
            />
            <IconButton
              icon="/icons/Info.svg"
              label="Help"
            />
          </div>
          <IconButton
            icon="/icons/Settings.svg"
            label="Settings"
            showLabel={false}
          />

        </div>
        <Avatar name={profileName} src={"/profile.png"} size={84} className="mb-3.5 border-3 border-surface shadow-[0_0_0_1px_var(--color-border)]" />
        <p className="text-[17px] font-semibold text-text-primary">{profileName}</p>
        <span className="mt-2 rounded-full bg-bg px-3.5 py-1 text-xs font-bold text-text-secondary">
          {roleLabel}
        </span>
        
        <div className="mt-4 py-1 px-3 flex w-full items-center justify-between border border-border text-xs font-semibold rounded-full">
          <span className="flex items-center gap-1.5 text-success-text bg-success-bg/50 rounded-full px-3.5 py-1">
            <span className="h-1.75 w-1.75 rounded-full bg-success-text" />
            Active
          </span>
         <span className="flex gap-3 item-center justify-center">
          <span className="text-text-secondary">Status</span>
          <ChevronRight size={16} />
         </span>
        </div>
      </div>

      <div className="mb-3.5 flex items-center justify-between text-md font-medium text-text-muted">
        Schedule
        <button aria-label="Add schedule" className="flex h-7 w-7 items-center justify-center ">
          <PlusIcon size={20} />
        </button>
      </div>

      <ScheduleTimeline />
    </aside>
  );
}
