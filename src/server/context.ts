export type Role = "HEADMASTER" | "TEACHER";

export type RequestContext = {
  userId: string;
  role: Role;
  schoolId: string | null;
  teacherId?: string;
  headmasterId?: string;
};
