"use client";

import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import Image from "next/image";

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center bg-surface border border-border gap-2.5 rounded-full pl-3 px-2 py-1.5 text-md font-semibold">
      <span className="font-medium text-text-secondary">{label}</span>
      <button className="flex items-center gap-1.5 rounded-full bg-bg py-2 pl-3.5 pr-3 text-sm">
        <span className="font-bold text-text-primary">{value}</span>
        <ChevronDownIcon size={14} className="text-text-muted" />
      </button>
    </div>
  );
}

export function DashboardHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-secondary">Admin overview · updated moments ago</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 xl:gap-6">
        <div className="flex justify-between item-center gap-3">
          <Pill label="Year" value="2026" />
          <Pill label="Term" value="First" />
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
