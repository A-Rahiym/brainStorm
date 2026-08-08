import { apiFetch } from "@/lib/api-client";
import type { DashboardStats } from "@/features/dashboard/types";

type ListResponse<T> = { data: T[]; meta: { page: number; limit: number; total: number } };

async function fetchTotal(path: string): Promise<number> {
  try {
    const res = await apiFetch<ListResponse<unknown>>(`${path}?page=1&limit=1`);
    return res.meta?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [students, teachers, subjects, classes, periods] = await Promise.all([
    fetchTotal("/students"),
    fetchTotal("/teachers"),
    fetchTotal("/academics/subjects"),
    fetchTotal("/academics/classes"),
    fetchTotal("/classroom/periods"),
  ]);
  return { students, teachers, subjects, classes, periods };
}
