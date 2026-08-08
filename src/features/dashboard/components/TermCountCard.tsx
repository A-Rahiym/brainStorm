import { Card } from "@/components/ui";
import Image from "next/image";

const BARS = Array.from({ length: 16 }, (_, i) => i >= 12);

export function TermCountCard({ remain = "4 wks" }: { remain?: string }) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-secondary">Term count</span>
        <span className="flex h-10 w-10 items-center bg-black justify-center rounded-full text-text-primary">
          <Image src="/icons/Time.svg" width={25} height={25} alt="" />
        </span>
      </div>
      <div className="flex items-end gap-1" aria-hidden>
        {BARS.map((off, i) => (
          <span
            key={i}
            className={`inline-block h-[22px] w-2 rounded-[3px] ${off ? "bg-border" : "bg-primary"}`}
            style={i === 4 || i === 9 ? { width: 3 } : undefined}
          />
        ))}
      </div>
      <div className="text-[13px] text-text-muted">
        Remain: <b className="font-bold text-text-primary">{remain}</b>
      </div>
    </Card>
  );
}
