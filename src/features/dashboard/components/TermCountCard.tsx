import { Card } from "@/components/ui";
import Image from "next/image";

export function TermCountCard({
  totalWeeks = 19,
  completedWeeks = 15,
  remain = "4 wks",
}: {
  totalWeeks?: number;
  completedWeeks?: number;
  remain?: string;
}) {
  const bars = Array.from({ length: totalWeeks }, (_, i) => i < completedWeeks);

  return (
    <Card className="flex flex-col !p-5">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-text-primary">Term count</span>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-black">
          <Image src="/icons/Time.svg" width={22} height={22} alt="" />
        </span>
      </div>
      <div
        className="mt-5.5 mb-4.5 flex gap-[5px]"
        role="img"
        aria-label={`${completedWeeks} of ${totalWeeks} weeks completed`}
      >
        {bars.map((on, i) => (
          <span key={i} className={`h-8.5 flex-1 rounded-md ${on ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
      <p className="text-sm text-text-secondary">
        Remain: <b className="font-bold text-text-primary">{remain}</b>
      </p>
    </Card>
  );
}
