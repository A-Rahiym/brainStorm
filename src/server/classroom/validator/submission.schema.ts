import { z } from "zod";

export const submitAssignmentSchema = z.object({
  assignmentId: z.string().uuid(),
  studentId: z.string().uuid(),
  content: z.string().nullable().optional(),
});

export const updateSubmissionSchema = z
  .object({
    content: z.string().nullable().optional(),
    status: z.enum(["SUBMITTED", "LATE", "GRADED"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
