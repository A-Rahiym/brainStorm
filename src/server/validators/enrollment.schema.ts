import { z } from "zod";

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
  enrollmentDate: z.coerce.date().optional(),
  status: z.enum(["ACTIVE", "TRANSFERRED", "WITHDRAWN"]).optional(),
});

export const updateEnrollmentSchema = z
  .object({
    enrollmentDate: z.coerce.date().optional(),
    status: z.enum(["ACTIVE", "TRANSFERRED", "WITHDRAWN"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
