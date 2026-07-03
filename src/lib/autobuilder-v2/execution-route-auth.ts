import type { NextRequest } from "next/server";

const EXECUTION_MODES_REQUIRING_AUTH = new Set([
  "execute",
  "rollback",
  "FULL_AUTONOMOUS",
  "SUPERADMIN_EXECUTE",
  "live"
]);

export function requiresOperatorAuth(input: Record<string, unknown>) {
  const mode = String(input.mode ?? "");
  return EXECUTION_MODES_REQUIRING_AUTH.has(mode);
}

export function requiresGatewayAuth(input: Record<string, unknown>) {
  const mode = String(input.execution_mode ?? input.mode ?? "APPROVAL_REQUIRED");

  // Gateway POST routes can create tool-run rows and dispatch provider writes.
  // Treat every gateway POST as operator-gated unless it is explicitly a
  // local/read-only health path handled outside the gateway router.
  return mode !== "OBSERVE_ONLY" || Boolean(input.tool_id || input.namespace || input.workflow);
}

export function verifyExecutionRouteAuth(request: NextRequest) {
  const configuredTokens = [
    process.env.AUTO_BUILDER_OPERATOR_TOKEN,
    process.env.AUTO_BUILDER_BRIDGE_TOKEN
  ].filter((value): value is string => Boolean(value && value.length >= 16));

  if (!configuredTokens.length) {
    return {
      ok: false as const,
      status: 503,
      message: "AUTO_BUILDER_OPERATOR_TOKEN or AUTO_BUILDER_BRIDGE_TOKEN must be configured for write-capable execution routes."
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return {
      ok: false as const,
      status: 401,
      message: "Bearer token required for write-capable execution routes."
    };
  }

  if (!configuredTokens.includes(match[1])) {
    return {
      ok: false as const,
      status: 403,
      message: "Bearer token is not authorized for Auto Builder execution routes."
    };
  }

  return { ok: true as const };
}

export function requireAuthorizedExecution(request: NextRequest, input: Record<string, unknown>) {
  if (!requiresGatewayAuth(input)) return { ok: true as const };
  return verifyExecutionRouteAuth(request);
}
