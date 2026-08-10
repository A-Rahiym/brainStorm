"use client";

import Link from "next/link";
import { Button, ControlPill } from "@/components/ui";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import { ADD_SYLLABUS_MODAL, AddSyllabusModal } from "@/features/subjects/components/AddSyllabusModal";
import { useUiStore } from "@/store/ui.store";

export function SubjectDetailHeader({ subjectName }: { subjectName: string }) {
  const openModal = useUiStore((s) => s.openModal);

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-3 text-2xl font-semibold tracking-[-0.01em] text-text-primary"
      >
        <Link href="/subjects" className="transition-colors hover:text-primary">
          Subjects
        </Link>
        <ChevronRightIcon size={18} className="text-text-muted" />
        <span className="text-primary" aria-current="page">
          {subjectName}
        </span>
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <ControlPill label="Year" variant="outline" size="md" value="2026" onClick={() => {}} />
        <ControlPill label="Term" variant="outline" size="md" value="First" onClick={() => {}} />
        <ControlPill label="Class" variant="outline" size="md" value="All" onClick={() => {}} />
        <Button
          variant="primary"
          className="h-12 rounded-full px-6 text-[15px]"
          onClick={() => openModal(ADD_SYLLABUS_MODAL)}
        >
          <PlusIcon size={18} /> Add Syllabus
        </Button>
      </div>

      <AddSyllabusModal />
    </div>
  );
}
