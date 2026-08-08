import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  admissionNumber: z.string().min(1),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(["MALE", "FEMALE"]),
  address: z.string().optional(),
  admissionDate: z.coerce.date(),
});

export const updateStudentSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    admissionNumber: z.string().min(1).optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    address: z.string().nullable().optional(),
    admissionDate: z.coerce.date().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED", "SUSPENDED"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
