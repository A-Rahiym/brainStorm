"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui";
import { IconButton } from "@/components/ui/IconButton";
import { ScheduleTimeline } from "@/components/charts/ScheduleTimeline";
import { TEACHER_BLOCKS } from "@/features/dashboard/mock/timeline";
import { RAIL_CLASS_TABS } from "@/features/dashboard/constants/constants";
import { useSessionStore } from "@/store/session.store";
import { usePeriodStore } from "@/store/period.store";
import { ChevronRightIcon, LogOutIcon, FilterIcon, PlusIcon } from "@/components/icons";
import { useLogout } from "@/features/auth/hooks/mutations/useLogin";

export function RightRail() {
  const role = useSessionStore((s) => s.role);
  const isTeacher = role === "TEACHER";
  const [activeClass, setActiveClass] = useState(RAIL_CLASS_TABS[0]);
  const openPeriod = usePeriodStore((s) => s.openPeriod);
  const logout = useLogout();
  const profileName = isTeacher ? "Grace Okon" : "Bello Salis Adam";
  const profileSubtitle = isTeacher ? "Mathematics" : "Headmaster";

  return (
    <aside className="sticky mx-2 top-5 hidden w-86 shrink-0 self-start rounded-2xl border border-border bg-surface p-5 pb-6 shadow-card lg:block">
      <div className="mb-4.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="relative">
            <IconButton icon="/icons/Bell.svg" label="Notifications" showLabel={false} />
            <span className="absolute right-1.5 top-1.5 h-1.75 w-1.75 rounded-full bg-[#F59E0B] shadow-[0_0_0_2px_var(--color-surface)]" />
          </span>
          <IconButton icon="/icons/Info.svg" label="Help" />
        </div>
        <IconButton icon="/icons/Settings.svg" label="Settings" showLabel={false} />
        <button
          aria-label="Log out"
          title="Log out"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-danger-text/10 hover:text-danger-text disabled:opacity-50"
        >
          <LogOutIcon size={18} />
        </button>
      </div>

      <div className="flex flex-col items-center border-b border-border pb-5 text-center">
        <Avatar
          name={profileName}
          src={"/images/profile.png"}
          size={84}
          className={`mb-4 border-3 border-surface shadow-[0_0_0_1px_var(--color-border)] ${isTeacher ? "bg-[#7A5C4B]! text-white!" : ""
            }`}
        />
        <h2 className="text-lg font-bold tracking-[-0.01em] text-text-primary">{profileName}</h2>
        <span className="mt-3 inline-flex h-9 items-center rounded-full border border-border-strong px-5 text-sm font-medium text-text-primary">
          {profileSubtitle}
        </span>
      </div>

      <div className="mt-4.5 flex items-center justify-between border-b border-border pb-5">
        <span className="inline-flex h-7.5 items-center gap-2 rounded-full bg-success-bg px-3.5 text-[13px] font-semibold text-success-text">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Active
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
          Status <ChevronRightIcon size={14} />
        </span>
      </div>

      {isTeacher ? (
        <>
          <div className="mb-3.5 mt-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Classes</h2>
            <button aria-label="Filter classes" className="text-text-secondary transition-colors hover:text-text-primary">
              <FilterIcon size={20} />
            </button>
          </div>
          <ScheduleTimeline
            variant="card"
            blocks={TEACHER_BLOCKS}
            onSelectPeriod={openPeriod}
            afterStrip={
              <div className="mb-4.5 flex gap-2" role="tablist" aria-label="Classes">
                {RAIL_CLASS_TABS.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={activeClass === c}
                    onClick={() => setActiveClass(c)}
                    className={`h-9.5 flex-1 rounded-full text-sm font-semibold transition-colors ${activeClass === c ? "bg-primary text-white" : "bg-bg text-text-primary hover:bg-[#EDEDF0]"
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            }
          />
        </>
      ) : (
        <>
          <div className="mb-3.5 mt-5 flex items-center justify-between text-md font-medium text-text-muted">
            Schedule
            <button aria-label="Add schedule" className="flex h-7 w-7 items-center justify-center">
              <PlusIcon size={20} />
            </button>
          </div>
          <ScheduleTimeline variant="chip" />
        </>
      )}
    </aside>
  );
}
