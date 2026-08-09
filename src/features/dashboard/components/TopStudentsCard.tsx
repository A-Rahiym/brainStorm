import { Card, ControlPill } from "@/components/ui";
import { StudentsIcon } from "@/components/icons";
import { RankedList, type RankedStudent } from "@/components/charts/RankedList";

export function TopStudentsCard({ students }: { students: RankedStudent[] }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary">
          <StudentsIcon size={17} className="text-text-secondary" />
          Top students
        </h3>
        <ControlPill label="By" value="All classes" onClick={() => {}} />
      </div>
      <RankedList students={students} />
    </Card>
  );
}