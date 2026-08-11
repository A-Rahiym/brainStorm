export type ComputedMetric = {
  value: string;
  trend: string;
  trendUp: boolean;
};

export function computeMetric(points: number[]): ComputedMetric {
  if (points.length === 0) {
    return { value: "0%", trend: "0%", trendUp: true };
  }

  const average = points.reduce((sum, p) => sum + p, 0) / points.length;

  const mid = Math.floor(points.length / 2);
  const firstHalf = points.slice(0, mid || 1);
  const secondHalf = points.slice(mid || 1);
  const firstAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
  const secondAvg = secondHalf.length
    ? secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length
    : firstAvg;

  const change = firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;

  return {
    value: `${average.toFixed(1)}%`,
    trend: `${Math.abs(change).toFixed(0)}%`,
    trendUp: change >= 0,
  };
}
