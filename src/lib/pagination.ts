export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function parsePagination(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(MAX_LIMIT, Number(url.searchParams.get("limit")) || DEFAULT_LIMIT);
  return { page, limit, skip: (page - 1) * limit, take: limit };
}
