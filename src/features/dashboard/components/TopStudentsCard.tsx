import { Card, ControlPill } from "@/components/ui";
import { StudentsIcon } from "@/components/icons";
import { RankedList, type RankedStudent } from "@/components/charts/RankedList";

export function TopStudentsCard({
  students,
  filterLabel = "By",
  filterValue = "All classes",
}: {
  students: RankedStudent[];
  filterLabel?: string;
  filterValue?: string;
}) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold text-text-primary">
          <StudentsIcon size={20} className="text-text-primary" />
          Top students
        </h3>
        <ControlPill label={filterLabel} value={filterValue} variant="outline" size="md" onClick={() => {}} />
      </div>
      <RankedList students={students} />
    </Card>
  );
}