"use client";

import { useId } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from "recharts";

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as { i: number; value: number };

  return (
    <div className="rounded-[10px] border border-border bg-surface px-2.5 py-2 text-[13px] font-semibold shadow-card">
      <div className="text-text-secondary">Week {point.i + 1}</div>
      <div className="text-text-primary">Class average: {point.value}%</div>
    </div>
  );
}

export function Sparkline({
  points,
  className = "",
}: {
  points: number[];
  className?: string;
}) {
  const gradientId = `spark-${useId().replace(/:/g, "")}`;
  const data = points.map((value, i) => ({ i, value }));

  return (
    <div className={`h-28 pt-3 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9F1244" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#9F1244" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: "#9F1244", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={(props) => <ChartTooltip {...props} />}
          />
          <Area
            type="natural"
            dataKey="value"
            stroke="#9F1244"
            strokeWidth={2.8}
            fill={`url(#${gradientId})`}
            dot={{ r: 2.5, fill: "#9F1244", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#9F1244", strokeWidth: 2, stroke: "#fff" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
