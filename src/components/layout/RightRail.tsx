"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui";
import { IconButton } from "@/components/ui/IconButton";
import { RightRailSkeleton } from "@/components/layout/RightRailSkeleton";
import { StatusMenu } from "@/components/layout/StatusMenu";
import { ScheduleTimeline } from "@/components/charts/ScheduleTimeline";
import { useClasses } from "@/features/dashboard/hooks/queries/useClasses";
import { useRightRailSchedule } from "@/features/dashboard/hooks/queries/useRightRailSchedule";
import { useSessionStore } from "@/store/session.store";
import { usePeriodStore } from "@/store/period.store";
import { useUiStore } from "@/store/ui.store";
import { LogOutIcon, FilterIcon, PlusIcon } from "@/components/icons";
import { useLogout } from "@/features/auth/hooks/mutations/useLogin";
import { useProfile } from "@/features/auth/hooks/queries/useProfile";

export function RightRail() {
  const role = useSessionStore((s) => s.role);
  const isHydrated = role !== null;
  const isTeacher = role === "TEACHER";
  const selectedDate = useUiStore((s) => s.selectedDate);
  const { data: classes } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const activeClassId = isTeacher ? (selectedClassId ?? classes?.[0]?.id) : undefined;
  const { data: schedule } = useRightRailSchedule({ classId: activeClassId, date: selectedDate });
  const openPeriod = usePeriodStore((s) => s.openPeriod);
  const logout = useLogout();
  useProfile();
  const profileName = useSessionStore((s) => s.profileName) ?? (isTeacher ? "Teacher" : "Headmaster");
  const profileAvatar = useSessionStore((s) => s.profileAvatar);
  const profileSubtitle = isTeacher ? "Teacher" : "Headmaster";

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

      {!isHydrated ? (
        <RightRailSkeleton />
      ) : (
        <>
          <div className="flex flex-col items-center border-b border-border pb-5 text-center">
            <Avatar
              name={profileName}
              src={profileAvatar}
              size={84}
              className={`mb-4 border-3 border-surface shadow-[0_0_0_1px_var(--color-border)] ${isTeacher ? "bg-[#7A5C4B]! text-white!" : ""
                }`}
            />
            <h2 className="text-lg font-bold tracking-[-0.01em] text-text-primary">{profileName}</h2>
            <span className="mt-3 inline-flex h-9 items-center rounded-full border border-border-strong px-5 text-sm font-medium text-text-primary">
              {profileSubtitle}
            </span>
          </div>

          <StatusMenu />

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
                blocks={schedule?.blocks ?? []}
                onSelectPeriod={openPeriod}
                afterStrip={
                  <div className="mb-4.5 flex gap-2" role="tablist" aria-label="Classes">
                    {(classes ?? []).map((c) => (
                      <button
                        key={c.id}
                        role="tab"
                        aria-selected={activeClassId === c.id}
                        onClick={() => setSelectedClassId(c.id)}
                        className={`h-9.5 flex-1 rounded-full text-sm font-semibold transition-colors ${activeClassId === c.id ? "bg-primary text-white" : "bg-bg text-text-primary hover:bg-[#EDEDF0]"
                          }`}
                      >
                        {c.name}
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
              <ScheduleTimeline variant="card" blocks={schedule?.blocks ?? []} onSelectPeriod={openPeriod} />
            </>
          )}
        </>
      )}
    </aside>
  );
}
