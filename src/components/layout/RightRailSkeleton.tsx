import { Skeleton } from "@/components/ui";

export function RightRailSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center border-b border-border pb-5 text-center">
        <Skeleton variant="avatar" className="mb-4 h-21 w-21" />
        <Skeleton variant="text" className="mb-3 h-5 w-32" />
        <Skeleton variant="text" className="h-9 w-24 rounded-full" />
      </div>

      <div className="mt-4.5 flex items-center justify-between border-b border-border pb-5">
        <Skeleton variant="text" className="h-7.5 w-20 rounded-full" />
        <Skeleton variant="text" className="h-5 w-16" />
      </div>

      <div className="mt-5 space-y-2.5">
        <Skeleton variant="text" className="mb-2.5 h-5 w-20" />
        <Skeleton variant="row" className="h-9" />
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-24" />
      </div>
    </>
  );
}
