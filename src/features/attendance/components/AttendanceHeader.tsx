"use client";

import { Button, ControlPill } from "@/components/ui";
import { PlusIcon } from "@/components/icons";
import { ATTENDANCE_META } from "@/features/attendance/constants/constants";
import type { Role } from "@/store/session.store";

export function AttendanceHeader({ initialRole }: { initialRole: Role }) {
  const meta = ATTENDANCE_META[initialRole];

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">{meta.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{meta.subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ControlPill label="Year" variant="outline" size="md" value="2026" onClick={() => {}} />
        <ControlPill label="Term" variant="outline" size="md" value="First" onClick={() => {}} />
        <Button variant="primary" className="h-12 rounded-full px-6 text-[15px]">
          <PlusIcon size={18} /> Log Complaint
        </Button>
      </div>
    </div>
  );
}
