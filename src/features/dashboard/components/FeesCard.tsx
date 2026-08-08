import { Card, ProgressBar } from "@/components/ui";
import { ChevronRightIcon, PaymentsIcon } from "@/components/icons";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { FeesSummary } from "@/features/dashboard/types";

export function FeesCard({ fees }: { fees: FeesSummary }) {
  const rate = fees.expected > 0 ? Math.round((fees.collected / fees.expected) * 100) : 0;

  return (
    <Card className="flex flex-col gap-4.5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-2 text-[15px] font-bold text-text-primary">
          <PaymentsIcon size={17} className="text-text-secondary" />
          Fees collected
        </h3>
        <span className="flex items-center gap-0.5 text-[13px] font-bold text-primary">
          Details <ChevronRightIcon size={13} />
        </span>
      </div>
      <div className="mb-1 text-4xl font-semibold leading-none tracking-tight text-text-primary">
        {formatCurrency(fees.collected)}
      </div>
      <div className="mb-4 text-[13px] text-text-secondary">of {formatCurrency(fees.expected)} expected</div>
      <div className="mb-3">
        <ProgressBar value={rate} />
      </div>
      <div className="flex justify-between text-[13px]">
        <span className="font-bold text-text-primary">
          {formatPercent(rate)} <span className="font-medium text-text-secondary">collected</span>
        </span>
        <span className="font-bold text-danger-text">
          {fees.defaulters} <span className="font-medium text-text-secondary">defaulters</span>
        </span>
      </div>
    </Card>
  );
}
