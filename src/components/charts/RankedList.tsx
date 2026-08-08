import { Badge } from "@/components/ui";
import { Avatar } from "@/components/ui";

export type RankedStudent = {
  id: string;
  name: string;
  meta: string;
  score: string;
  grade: string;
  avatar?: string | null;
};

export function RankedList({ students }: { students: RankedStudent[] }) {
  return (
    <div>
      {students.map((student, index) => (
        <div key={student.id} className="flex items-center gap-5 border-b border-border px-0 py-8 last:border-b-0">
          <span className="w-4 shrink-0 text-[13px] font-bold text-text-muted">{index + 1}</span>
          <Avatar name={student.name} src={student.avatar} size={50} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xl font-semibold text-text-primary">{student.name}</div>
            <div className="mt-0.5 text-xs text-text-muted">{student.meta}</div>
          </div>
          <span className="mr-2.5 text-sm font-bold text-text-primary">{student.score}</span>
          <Badge tone="success">{student.grade}</Badge>
        </div>
      ))}
    </div>
  );
}
