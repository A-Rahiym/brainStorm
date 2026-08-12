export function parseTimeRange(time: string | undefined): { start: number; end: number } | null {
  const match = time?.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, sh, sm, eh, em] = match.slice(1).map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (end <= start) return null;
  return { start, end };
}
