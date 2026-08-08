import { z } from "zod";

export const createPeriodSchema = z.object({
  name: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime must be HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "endTime must be HH:mm"),
});

export const updatePeriodSchema = z
  .object({
    name: z.string().min(1).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime must be HH:mm").optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "endTime must be HH:mm").optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
