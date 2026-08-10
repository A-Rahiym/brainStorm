import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { TeacherSubject } from "@/features/subjects/types";

export function SubjectCard({ subject }: { subject: TeacherSubject }) {
  return (
    <Link
      href={`/subjects/${subject.id}`}
      className="flex w-[356px] flex-none flex-col rounded-2xl border border-border bg-surface p-6 shadow-card transition-colors hover:border-primary-pill"
    >
      <span className="mb-4.5 flex h-12 w-12 items-center justify-center rounded-full bg-accent-black text-white">
        <BookOpen size={24} />
      </span>
      <h2 className="mb-3.5 text-[32px] font-bold leading-none tracking-[-0.02em] text-text-primary">
        {subject.name}
      </h2>
      <div className="flex items-center gap-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-primary-track"
          role="progressbar"
          aria-valuenow={subject.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${subject.progress}%` }} />
        </div>
        <span className="flex-none text-sm font-semibold text-text-primary">{subject.progress}%</span>
      </div>
      <p className="mt-3.5 text-sm text-text-secondary">
        Students: <b className="font-bold text-text-primary">{subject.students}</b>
      </p>
    </Link>
  );
}
