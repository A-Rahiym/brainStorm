"use client";

import { Button, ControlPill } from "@/components/ui";
import Image from "next/image";

export function DashboardHeader({ initialRole }: { initialRole: "HEADMASTER" | "TEACHER" }) {
  const subtitle = initialRole === "TEACHER" ? "Teacher overview · updated moments ago" : "Admin overview · updated moments ago";
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 xl:gap-6">
        <div className="flex justify-between item-center gap-3">
          <ControlPill label="Year" variant="outline" size="md" value="2026" onClick={() => {}} />
          <ControlPill label="Term" variant="outline" size="md" value="First" onClick={() => {}} />
          <button className="flex items-center justify-between bg-surface gap-3 rounded-full py-2 px-2 text-md">
            <div className="flex w-12 h-10 item-center justify-center rounded-full bg-bg">
              <Image src="/icons/export.svg" alt="Export" width={18} height={18} />
            </div>
            <span className="hidden font-semibold text-text-primary sm:inline">Export</span>
          </button>
        </div>
        <Button className="h-12 w-12 rounded-full xl:h-15 xl:w-15" aria-label="Add">
          <Image src="/icons/plus.svg" alt="Add" width={26} height={26} />
        </Button>
      </div>
    </div>
  );
}
