"use client";

import { TopNav } from "@/components/layout/TopNav";
import { RightRail } from "@/components/layout/RightRail";
import { PeriodPopover } from "@/features/subjects/components/PeriodPopover";
import { PeriodSessionModal } from "@/features/subjects/components/PeriodSessionModal";
import { Toaster } from "@/components/ui";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex min-w-0 flex-1 flex-col mx-1">
        <TopNav />
        <main className="min-w-0 flex-1 px-8 py-2">{children}</main>
      </div>
      <RightRail />
      <PeriodPopover />
      <PeriodSessionModal />
      <Toaster />
    </div>
  );
}
