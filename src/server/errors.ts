export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  details: unknown;

  constructor(details: unknown) {
    super("VALIDATION_ERROR", "Invalid request", 400);
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = "Authentication required") {
    super("UNAUTHORIZED", msg, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = "Not allowed") {
    super("FORBIDDEN", msg, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super("NOT_FOUND", `${entity} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(msg: string) {
    super("CONFLICT", msg, 409);
  }
}
