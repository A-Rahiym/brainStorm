import { ForbiddenError } from "@/server/errors";
import type { RequestContext } from "@/server/context";
import { hasPermission } from "@/server/permissions/map";

export function requirePermission(ctx: RequestContext, permission: string) {
  if (!hasPermission(ctx.role, permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}
