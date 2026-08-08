import { z } from "zod";

export const createAttendanceSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  termId: z.string().uuid(),
  date: z.coerce.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
});

export const updateAttendanceSchema = z
  .object({
    status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
