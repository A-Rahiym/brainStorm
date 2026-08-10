import { Card } from "@/components/ui";
import Image from "next/image";

const TICKS = Array.from({ length: 16 }, (_, i) => i < 12);

export function TermCountCard({ remain = "4 wks" }: { remain?: string }) {
  return (
    <Card className="flex flex-col !p-5">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium text-text-primary">Term count</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-black">
          <Image src="/icons/Time.svg" width={20} height={20} alt="" />
        </span>
      </div>
      <div className="flex items-end" role="img" aria-label="12 of 16 weeks elapsed">
        {Array.from({ length: 4 }, (_, g) => (
          <div key={g} className="mr-2.5 flex items-end gap-1 last:mr-0">
            {TICKS.slice(g * 4, g * 4 + 4).map((on, i) => (
              <span
                key={i}
                className={`inline-block w-[7px] rounded-[3px] ${on ? "bg-primary" : "bg-primary-track"}`}
                style={{ height: 34 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-[13px] text-text-secondary">
        Remain: <b className="font-bold text-text-primary">{remain}</b>
      </div>
    </Card>
  );
}
