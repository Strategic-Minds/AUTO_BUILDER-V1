import type { NextRequest } from "next/server";

export function requiresOperatorAuth(input: Record<string, unknown>) {
  return input.mode === "execute" || input.mode === "rollback";
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
      message: "AUTO_BUILDER_OPERATOR_TOKEN or AUTO_BUILDER_BRIDGE_TOKEN must be configured for execute/rollback routes."
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return {
      ok: false as const,
      status: 401,
      message: "Bearer token required for execute/rollback routes."
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
