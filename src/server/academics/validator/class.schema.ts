import { z } from "zod";

export const createClassSchema = z.object({
  name: z.string().min(1),
  level: z.string().min(1),
  capacity: z.number().int().positive(),
});

export const updateClassSchema = z
  .object({
    name: z.string().min(1).optional(),
    level: z.string().min(1).optional(),
    capacity: z.number().int().positive().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
