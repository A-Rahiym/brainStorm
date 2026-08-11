import { apiFetch, type SingleResponse } from "@/lib/request";
import type { ClassOption, DashboardStats, DaySchedule } from "@/features/dashboard/types";

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

function dateParam(date?: Date): string | undefined {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

export async function fetchTodaySchedule(params: { classId?: string; date?: Date }): Promise<DaySchedule> {
  const qs = new URLSearchParams();
  if (params.classId) qs.set("classId", params.classId);
  const date = dateParam(params.date);
  if (date) qs.set("date", date);
  const res = await apiFetch<SingleResponse<DaySchedule>>(`/classroom/timetable/today?${qs.toString()}`);
  return res.data;
}

export async function startPeriod(input: { timetableEntryId: string; date?: Date }): Promise<void> {
  await apiFetch<SingleResponse<unknown>>("/classroom/period-sessions", {
    method: "POST",
    body: JSON.stringify({ timetableEntryId: input.timetableEntryId, date: dateParam(input.date) }),
  });
}

export async function fetchClasses(): Promise<ClassOption[]> {
  const res = await apiFetch<ListResponse<ClassOption>>("/academics/classes?limit=50");
  return res.data;
}
