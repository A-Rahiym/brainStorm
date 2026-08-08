import { z } from "zod";

export const createTeacherSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  staffNumber: z.string().min(1),
  dateOfBirth: z.coerce.date(),
  address: z.string().optional(),
  employmentDate: z.coerce.date(),
  qualification: z.string().optional(),
  userId: z.string().uuid().optional(),
});

export const updateTeacherSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().nullable().optional(),
    staffNumber: z.string().min(1).optional(),
    dateOfBirth: z.coerce.date().optional(),
    address: z.string().nullable().optional(),
    employmentDate: z.coerce.date().optional(),
    qualification: z.string().nullable().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
