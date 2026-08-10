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

const AVATAR_COLORS = ["#8E3B5E", "#2F5FA8", "#3F6E52", "#B45309", "#4B4B57"];

export function RankedList({ students }: { students: RankedStudent[] }) {
  return (
    <div>
      {students.map((student, index) => (
        <div
          key={student.id}
          className="grid grid-cols-[20px_44px_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border py-3.5 last:border-b-0 last:pb-0.5"
        >
          <span className="text-center text-[13px] font-medium text-text-secondary">{index + 1}</span>
          <Avatar
            name={student.name}
            src={student.avatar}
            size={44}
            className="!text-white"
            style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-text-primary">{student.name}</p>
            <p className="mt-0.5 text-[13px] text-text-secondary">{student.meta}</p>
          </div>
          <span className="text-base font-semibold text-text-primary">{student.score}</span>
          <Badge tone="grade" className="ml-2">{student.grade}</Badge>
        </div>
      ))}
    </div>
  );
}