import { useId } from "react";

const WIDTH = 420;
const HEIGHT = 96;

function toPoints(values: number[]): { x: number; y: number }[] {
  const step = values.length > 1 ? WIDTH / (values.length - 1) : 0;
  return values.map((y, i) => ({ x: i * step, y: Math.max(0, Math.min(HEIGHT, y)) }));
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function Sparkline({
  points,
  className = "",
}: {
  points: number[];
  className?: string;
}) {
  const gradientId = `spark-${useId().replace(/:/g, "")}`;
  const pts = toPoints(points);
  const line = smoothPath(pts);
  const area = `${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`;

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9F1244" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#9F1244" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="#9F1244"
        strokeWidth="2.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
