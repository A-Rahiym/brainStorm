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
  chip,
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
  chip?: string;
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
          className={`text-[15px] font-medium ${primary ? "text-white/80" : "text-text-primary"}`}
        >
          {label}
        </span>
        {(icon || iconSrc) && (
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              primary ? "bg-white/15 text-white" : "bg-accent-black text-white"
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
      <div className="flex items-center gap-2.5">
        <span className="text-[32px] font-bold leading-none tracking-[-0.02em]">{value}</span>
        {chip && (
          <span className="inline-flex h-7.5 items-center rounded-full bg-primary-pill px-3 text-sm font-bold text-primary">
            {chip}
          </span>
        )}
        {trend && trendValue && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold ${
              primary
                ? "bg-white/15 text-white"
                : trend === "up"
                  ? "bg-success-bg text-success-text"
                  : "bg-danger-text/10 text-danger-text"
            }`}
          >
            {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </span>
        )}
      </div>
      {footnote && (
        <div className={`text-[13px] ${primary ? "text-white/70" : "text-text-secondary"}`}>{footnote}</div>
      )}
    </div>
  );
}
