import { NextRequest } from "next/server";

export type CronAuthorizationResult = {
  ok: boolean;
  status: number;
  mode: "open_local" | "authorized" | "unauthorized" | "missing_configuration";
  reason: string;
  tokenSource: "authorization" | "x-cron-token" | "x-cron-secret" | "missing";
  acceptedHeaderNames: string[];
};

function readCronToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return {
      token: authorization.slice("Bearer ".length).trim(),
      tokenSource: "authorization" as const
    };
  }

  const headerToken = request.headers.get("x-cron-token")?.trim();
  if (headerToken) {
    return {
      token: headerToken,
      tokenSource: "x-cron-token" as const
    };
  }

  const legacySecret = request.headers.get("x-cron-secret")?.trim();
  if (legacySecret) {
    return {
      token: legacySecret,
      tokenSource: "x-cron-secret" as const
    };
  }

  return {
    token: "",
    tokenSource: "missing" as const
  };
}

function isLocalDevelopment() {
  return process.env.NODE_ENV !== "production" && !process.env.VERCEL;
}

export function authorizeCronRequest(request: NextRequest): CronAuthorizationResult {
  const acceptedTokens = [process.env.CRON_SECRET, process.env.CRON_API_TOKEN, process.env.EPOXY_CRON_SECRET].filter(
    (value): value is string => Boolean(value && value.length >= 8)
  );

  if (acceptedTokens.length === 0) {
    if (isLocalDevelopment()) {
      return {
        ok: true,
        status: 200,
        mode: "open_local",
        reason: "No cron token configured. Route is open only in local development.",
        tokenSource: "missing",
        acceptedHeaderNames: ["authorization", "x-cron-token", "x-cron-secret"]
      };
    }

    return {
      ok: false,
      status: 503,
      mode: "missing_configuration",
      reason: "CRON_SECRET, CRON_API_TOKEN, or EPOXY_CRON_SECRET must be configured before cron execution outside local development.",
      tokenSource: "missing",
      acceptedHeaderNames: ["authorization", "x-cron-token", "x-cron-secret"]
    };
  }

  const { token, tokenSource } = readCronToken(request);
  const authorized = acceptedTokens.includes(token);

  return {
    ok: authorized,
    status: authorized ? 200 : 401,
    mode: authorized ? "authorized" : "unauthorized",
    reason: authorized ? "Cron request authorized." : "Invalid or missing cron token.",
    tokenSource,
    acceptedHeaderNames: ["authorization", "x-cron-token", "x-cron-secret"]
  };
}
