import { z } from "zod";

export const createAssessmentSchema = z.object({
  teachingAssignmentId: z.string().uuid(),
  termId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["QUIZ", "TEST", "CA", "EXAMINATION"]),
  maxScore: z.coerce.number().positive(),
  date: z.coerce.date(),
});

export const updateAssessmentSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: z.enum(["QUIZ", "TEST", "CA", "EXAMINATION"]).optional(),
    maxScore: z.coerce.number().positive().optional(),
    date: z.coerce.date().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
