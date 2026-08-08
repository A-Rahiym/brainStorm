const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";
const DEFAULT_TIMEOUT_MS = 15_000;

export type ErrorDetail = { field: string; message: string };

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: ErrorDetail[];

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = Array.isArray(details)
      ? (details as ErrorDetail[]).filter((d) => d && typeof d === "object" && "field" in d && "message" in d)
      : [];
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "TimeoutError";
  }
}

export type ListMeta = { page: number; limit: number; total: number };

export type ListResponse<T> = { data: T[]; meta: ListMeta };
export type SingleResponse<T> = { data: T };

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = null;
  }
  const err = body?.error;
  return new ApiError(
    err?.code ?? "HTTP_ERROR",
    err?.message ?? `Request failed with status ${response.status}`,
    response.status,
    err?.details
  );
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "content-type": "application/json", ...init.headers },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new TimeoutError();
    }
    throw new NetworkError();
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  const payload = (await response.json()) as T | ApiErrorBody;
  if (payload && typeof payload === "object" && "error" in payload) {
    const err = (payload as ApiErrorBody).error;
    throw new ApiError(err.code, err.message, response.status, err.details);
  }
  return payload as T;
}
