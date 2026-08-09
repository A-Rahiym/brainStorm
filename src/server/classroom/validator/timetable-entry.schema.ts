import { z } from "zod";

export const createTimetableEntrySchema = z.object({
  classId: z.string().uuid(),
  teachingAssignmentId: z.string().uuid(),
  periodId: z.string().uuid(),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
});
