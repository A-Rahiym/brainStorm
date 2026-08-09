import { z } from "zod";

const staffFields = {
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.coerce.date(),
  address: z.string().optional(),
  employmentDate: z.coerce.date(),
};

export const createHeadmasterSchema = z.object({
  ...staffFields,
  staffNumber: z.string().min(1),
  userId: z.string().uuid().optional(),
});

export const updateHeadmasterSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().nullable().optional(),
    dateOfBirth: z.coerce.date().optional(),
    address: z.string().nullable().optional(),
    employmentDate: z.coerce.date().optional(),
    staffNumber: z.string().min(1).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");
