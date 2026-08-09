import { z } from "zod";

export const recordScoresSchema = z.object({
  assessmentId: z.string().uuid(),
  scores: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        score: z.coerce.number().min(0),
        remark: z.string().nullable().optional(),
      })
    )
    .min(1),
});

export const updateScoreSchema = z
  .object({
    score: z.coerce.number().min(0).optional(),
    remark: z.string().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
