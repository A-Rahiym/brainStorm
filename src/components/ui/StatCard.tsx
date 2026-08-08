import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export function StatCard({
  label,
  value,
  icon,
  iconSrc,
  iconClassName = "",
  trend,
  trendValue,
  footnote,
  primary = false,
  className = "",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconSrc?: string;
  iconClassName?: string;
  trend?: "up" | "down";
  trendValue?: string;
  footnote?: React.ReactNode;
  primary?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-5 rounded-2xl p-5 ${
        primary ? "bg-primary text-white" : "border border-border bg-surface shadow-card"
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${primary ? "text-white/80" : "text-text-secondary"}`}
        >
          {label}
        </span>
        {(icon || iconSrc) && (
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              primary ? "bg-white/15 text-white" : "bg-bg text-text-primary"
            } ${iconClassName}`}
          >
            {iconSrc ? (
              <Image src={iconSrc} width={20} height={20} alt="" />
            ) : (
              icon
            )}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="text-[32px] font-semibold leading-none tracking-tight">{value}</span>
        {trend && trendValue && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold ${
              trend === "up" ? "bg-success-bg text-success-text" : "bg-danger-text/10 text-danger-text"
            } ${primary ? "!bg-white/20 !text-white" : ""}`}
          >
            {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </span>
        )}
      </div>
      {footnote && (
        <div className={`text-[13px] ${primary ? "text-white/70" : "text-text-muted"}`}>{footnote}</div>
      )}
    </div>
  );
}
