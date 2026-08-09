import { z } from "zod";

export const createAssignmentSchema = z.object({
  teachingAssignmentId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  dueDate: z.coerce.date(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

export const updateAssignmentSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    dueDate: z.coerce.date().optional(),
    status: z.enum(["OPEN", "CLOSED"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
