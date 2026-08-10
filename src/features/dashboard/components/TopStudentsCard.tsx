import { Card, ControlPill } from "@/components/ui";
import { StudentsIcon } from "@/components/icons";
import { RankedList, type RankedStudent } from "@/components/charts/RankedList";

export function TopStudentsCard({ students }: { students: RankedStudent[] }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
          <StudentsIcon size={20} className="text-text-primary" />
          Top students
        </h3>
        <ControlPill label="By" value="All classes" variant="outline" size="md" onClick={() => {}} />
      </div>
      <RankedList students={students} />
    </Card>
  );
}