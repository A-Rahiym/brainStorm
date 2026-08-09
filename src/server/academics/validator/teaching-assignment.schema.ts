import { z } from "zod";

export const createTeachingAssignmentSchema = z.object({
  teacherId: z.string().uuid(),
  classSubjectId: z.string().uuid(),
  academicSessionId: z.string().uuid(),
  termId: z.string().uuid(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateTeachingAssignmentSchema = z
  .object({
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
