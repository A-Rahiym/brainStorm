import { z } from "zod";

const toDecimal = z.coerce.number();

export const createGradeSchema = z.object({
  name: z.string().min(1),
  minScore: toDecimal,
  maxScore: toDecimal,
  remark: z.string().optional(),
});

export const updateGradeSchema = z
  .object({
    name: z.string().min(1).optional(),
    minScore: toDecimal.optional(),
    maxScore: toDecimal.optional(),
    remark: z.string().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
