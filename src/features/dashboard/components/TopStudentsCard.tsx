import { Card } from "@/components/ui";
import { ChevronDownIcon, StudentsIcon } from "@/components/icons";
import { RankedList, type RankedStudent } from "@/components/charts/RankedList";

export function TopStudentsCard({ students }: { students: RankedStudent[] }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary">
          <StudentsIcon size={17} className="text-text-secondary" />
          Top students
        </h3>
        <div className="bg-bg flex items-center gap-2.5 rounded-full pl-3  px-2 py-1 text-md font-semibold">
          By
          <button className="flex bg-surface items-center gap-1 rounded-full  px-3 py-1.5 font-semibold text-text-primary hover:bg-bg">
            All classes <ChevronDownIcon size={12} className="text-text-muted" />
          </button>
        </div>
      </div>
      <RankedList students={students} />
    </Card>
  );
}