import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
});

export const updateSubjectSchema = z
  .object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
