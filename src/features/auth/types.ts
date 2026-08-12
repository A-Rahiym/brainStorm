export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: "HEADMASTER" | "TEACHER";
};

export type LoginResponse = {
  user: AuthUser;
};

export type SessionPayload = {
  userId: string;
  role: "HEADMASTER" | "TEACHER";
  schoolId: string | null;
  teacherId?: string;
  headmasterId?: string;
};

export type SessionResponse = {
  authenticated: boolean;
  session: (SessionPayload & { iat?: number; exp?: number }) | null;
};

export type Profile = {
  name: string;
  avatar: string | null;
  role: "TEACHER" | "HEADMASTER";
};
