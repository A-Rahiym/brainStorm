"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type DonutSlice = { key: string; label: string; value: number; color: string };

export function DonutChart({
  data,
  centerValue,
  centerLabel,
  height = 200,
}: {
  data: DonutSlice[];
  centerValue?: string;
  centerLabel?: string;
  height?: number;
}) {
  return (
    <div className="relative shrink-0" style={{ width: height, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="68%"
            outerRadius="92%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((slice) => (
              <Cell key={slice.key} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--color-border)",
              fontSize: 13,
              fontWeight: 600,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerValue && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-semibold leading-none text-text-primary">{centerValue}</span>
          {centerLabel && (
            <span className="mt-1 text-[11px] font-bold tracking-wider text-text-muted">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
