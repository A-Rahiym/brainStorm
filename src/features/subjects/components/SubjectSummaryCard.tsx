import { BookOpen } from "lucide-react";
import type { TeacherSubject } from "@/features/subjects/types";

export function SubjectSummaryCard({ subject }: { subject: TeacherSubject }) {
  return (
    <article className="flex flex-col rounded-2xl bg-primary p-6 text-white shadow-card">
      <span className="mb-4.5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary">
        <BookOpen size={24} />
      </span>
      <h2 className="mb-3.5 text-[32px] font-bold leading-none tracking-[-0.02em]">{subject.name}</h2>
      <div className="flex items-center gap-3">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-white/30"
          role="progressbar"
          aria-valuenow={subject.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-white" style={{ width: `${subject.progress}%` }} />
        </div>
        <span className="flex-none text-sm font-semibold">{subject.progress}%</span>
      </div>
      <p className="mt-3.5 text-sm text-white/75">
        Students: <b className="font-bold text-white">{subject.students}</b>
      </p>
    </article>
  );
}
