import { z } from "zod";
import { AppError } from "@/server/errors";

export function respondSuccess(data: unknown, status = 200) {
  return Response.json({ data }, { status });
}

export function respondPaginated(data: unknown[], page: number, limit: number, total: number) {
  return Response.json({ data, meta: { page, limit, total } });
}

export function respondError(code: string, message: string, status: number, details?: unknown) {
  return Response.json({ error: { code, message, details } }, { status });
}

export function withErrorHandler<C>(fn: (req: Request, context: C) => Promise<Response>) {
  return async (req: Request, context: C): Promise<Response> => {
    try {
      return await fn(req, context);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return respondError("VALIDATION_ERROR", "Invalid request", 400, err.flatten());
      }
      if (err instanceof AppError) {
        const appError = err as AppError & { details?: unknown };
        return respondError(appError.code, appError.message, appError.status, appError.details);
      }
      console.error(err);
      return respondError("INTERNAL_SERVER_ERROR", "Something went wrong", 500);
    }
  };
}
