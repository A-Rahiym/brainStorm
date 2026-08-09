import { z } from "zod";

export const createFeeStructureSchema = z.object({
  academicSessionId: z.string().uuid(),
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  description: z.string().nullable().optional(),
});

export const updateFeeStructureSchema = z
  .object({
    name: z.string().min(1).optional(),
    amount: z.coerce.number().positive().optional(),
    description: z.string().nullable().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
