import type { RequestContext } from "@/server/context";
import { requirePermission } from "@/server/permissions/guard";
import {
  findCurrentTerm,
  listAssignments,
  topScoredStudents,
} from "@/server/shared/repository/dashboard.repository";
import {
  subjectCalendarEventDays,
  subjectPeriods,
  subjectScoreProgress,
  teacherAttendanceTrend,
  teacherScoreTrend,
  teacherSubjects,
} from "@/server/teachers/repository/teacher-dashboard.repository";
import { toRankedStudent } from "@/server/shared/helpers";
import { dayOfWeekOf, formatTime } from "@/server/classroom/service/schedule-time";
import { CLASS_FILTERS } from "@/features/subjects/constants/constants";
import type {
  SubjectClassGroup,
  SubjectDetail,
  SubjectPeriod,
  TeacherSubjects,
  TeacherSubject,
} from "@/features/subjects/types";
import type { AssignmentItem } from "@/features/dashboard/types";

const createdSubjects: TeacherSubject[] = [];

/**
 * Groups a subject's raw weekly timetable rows by class name and maps each
 * into the frontend's SubjectPeriod shape, deriving whether it's currently
 * live (matches today's day-of-week and the current time falls within it)
 * and whether it's a double period (60+ minutes).
 * @param rows - raw timetable rows as returned by subjectPeriods
 * @returns one group per class, each containing that class's periods for the subject
 */
function toSubjectClassGroups(rows: Awaited<ReturnType<typeof subjectPeriods>>): SubjectClassGroup[] {
  const now = new Date();
  const today = dayOfWeekOf(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const byClass = new Map<string, SubjectPeriod[]>();
  for (const row of rows) {
    const { startTime: start, endTime: end } = row.period;
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const isLive = row.dayOfWeek === today && nowMinutes >= startMinutes && nowMinutes < endMinutes;

    const period: SubjectPeriod = {
      id: row.id,
      startHour: start.getHours(),
      topic: row.period.name,
      time: `${formatTime(start)} - ${formatTime(end)}`,
      code: endMinutes - startMinutes >= 60 ? "DP" : "SP",
      status: isLive ? "live" : "ended",
      isMine: true,
    };

    const list = byClass.get(row.class.name) ?? [];
    list.push(period);
    byClass.set(row.class.name, list);
  }

  return [...byClass.entries()].map(([className, periods]) => ({ className, periods }));
}

/**
 * Maps a raw assignment repository row into the AssignmentItem shape used
 * by the frontend, deriving the display due-date label.
 * @param a - a single assignment record as returned by listAssignments
 * @returns the UI-ready AssignmentItem
 */
function toAssignmentItem(
  a: Awaited<ReturnType<typeof listAssignments>>[number]
): AssignmentItem {
  return {
    id: a.id,
    title: a.title,
    subject: a.teachingAssignment.classSubject.subject.name,
    className: a.teachingAssignment.classSubject.class.name,
    dueDate: a.dueDate.toISOString(),
    status: a.status as "OPEN" | "CLOSED",
    type: "Assessment",
    submitted: a._count.submissions,
    dueLabel: `DUE ${a.dueDate
      .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
      .toUpperCase()}`,
    foot: "Snap & upload",
  };
}

/**
 * Assembles the teacher's subjects dashboard: the subjects they teach with
 * enrollment and progress figures, their assignments, and top-scoring
 * students, merged with any subjects created in-memory via createSyllabus.
 * @param ctx - request context carrying the caller's teacher/school scope; must have "dashboard.read" permission
 * @returns the assembled TeacherSubjects view model; returns empty subjects/assignments/topStudents if the caller has no teacher id or no active term
 */
export async function getTeacherSubjects(ctx: RequestContext): Promise<TeacherSubjects> {
  requirePermission(ctx, "dashboard.read");

  let subjects: TeacherSubject[] = [];
  let assignments: AssignmentItem[] = [];
  let topStudents: TeacherSubjects["topStudents"] = [];

  if (ctx.teacherId) {
    const context = await findCurrentTerm(ctx);
    if (context) {
      const [rows, topRows, subjectRows, progressRows] = await Promise.all([
        listAssignments(ctx, context.termId, { teacherId: ctx.teacherId }),
        topScoredStudents(ctx, context.termId, context.sessionId, { teacherId: ctx.teacherId, limit: 5 }),
        teacherSubjects(ctx, ctx.teacherId, context.termId),
        subjectScoreProgress(ctx, ctx.teacherId, context.termId),
      ]);

      const progressBySubject = new Map(progressRows.map((p) => [p.subjectId, p.progress]));

      assignments = rows.map(toAssignmentItem);
      topStudents = topRows.map(toRankedStudent);
      subjects = subjectRows.map((row) => ({
        id: row.subjectId,
        name: row.subjectName,
        code: row.subjectCode,
        students: row.students,
        progress: progressBySubject.get(row.subjectId) ?? 0,
      }));
    }
  }

  return {
    subjects: [...subjects, ...createdSubjects],
    assignments,
    topStudents,
    classes: CLASS_FILTERS,
  };
}

/**
 * Creates a new syllabus/subject entry and holds it in an in-memory list for
 * the lifetime of the server process (a stand-in for persistent storage).
 * @param ctx - request context carrying the caller's scope; must have "dashboard.write" permission
 * @param input - the new subject's name and code
 * @returns the newly created TeacherSubject, with a generated id and zeroed students/progress
 */
export async function createSyllabus(
  ctx: RequestContext,
  input: Pick<TeacherSubject, "name" | "code">
): Promise<TeacherSubject> {
  requirePermission(ctx, "dashboard.write");

  const subject: TeacherSubject = {
    id: `syllabus-${Date.now()}`,
    name: input.name,
    code: input.code,
    students: 0,
    progress: 0,
  };
  createdSubjects.push(subject);
  return subject;
}

/**
 * Assembles the full subject-detail view for one of a teacher's subjects:
 * enrollment/progress summary, score and attendance trend metrics, the
 * weekly periods panel, assessment calendar event days, assignments, and
 * top-scoring students — all scoped to that single subject.
 * @param ctx - request context carrying the caller's teacher/school scope; must have "dashboard.read" permission
 * @param subjectId - the subject to build the detail view for
 * @returns the assembled SubjectDetail view model; returns null if the caller has no teacher id, no active term, or does not teach this subject
 */
export async function getSubjectDetail(ctx: RequestContext, subjectId: string): Promise<SubjectDetail | null> {
  requirePermission(ctx, "dashboard.read");
  if (!ctx.teacherId) return null;

  const context = await findCurrentTerm(ctx);
  if (!context) return null;

  const subjectRows = await teacherSubjects(ctx, ctx.teacherId, context.termId);
  const subjectRow = subjectRows.find((r) => r.subjectId === subjectId);
  if (!subjectRow) return null;

  const [progressRows, scoreTrend, attendanceTrend, periodRows, eventDays, assignmentRows, topRows] =
    await Promise.all([
      subjectScoreProgress(ctx, ctx.teacherId, context.termId),
      teacherScoreTrend(ctx, ctx.teacherId, context.termId, subjectId),
      teacherAttendanceTrend(ctx, ctx.teacherId, context.termId, subjectId),
      subjectPeriods(ctx, ctx.teacherId, context.termId, subjectId),
      subjectCalendarEventDays(ctx, ctx.teacherId, context.termId, subjectId),
      listAssignments(ctx, context.termId, { teacherId: ctx.teacherId, subjectId }),
      topScoredStudents(ctx, context.termId, context.sessionId, { teacherId: ctx.teacherId, limit: 5, subjectId }),
    ]);

  const progress = progressRows.find((p) => p.subjectId === subjectId)?.progress ?? 0;
  const scorePoints = scoreTrend.map((p) => p.value);
  const attendancePoints = attendanceTrend.map((p) => p.value);

  return {
    subject: {
      id: subjectRow.subjectId,
      name: subjectRow.subjectName,
      code: subjectRow.subjectCode,
      students: subjectRow.students,
      progress,
    },
    metrics: [
      {
        id: "class-performance",
        label: "Class Performance",
        value: scorePoints.length ? `${scorePoints[scorePoints.length - 1]}%` : "0%",
        trend: "",
        points: scorePoints,
      },
      {
        id: "attendance-rate",
        label: "Attendance Rate",
        value: attendancePoints.length ? `${attendancePoints[attendancePoints.length - 1]}%` : "0%",
        trend: "",
        points: attendancePoints,
      },
    ],
    calendarEventDays: eventDays,
    classes: toSubjectClassGroups(periodRows),
    assignments: assignmentRows.map(toAssignmentItem),
    topStudents: topRows.map(toRankedStudent),
  };
}
