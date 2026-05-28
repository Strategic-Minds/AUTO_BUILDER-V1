import { NextRequest } from "next/server";

export type CronAuthorizationResult = {
  ok: boolean;
  status: number;
  mode: "open" | "authorized" | "unauthorized";
  reason: string;
  tokenSource: "authorization" | "x-cron-token" | "missing";
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

  return {
    token: "",
    tokenSource: "missing" as const
  };
}

export function authorizeCronRequest(request: NextRequest): CronAuthorizationResult {
  const acceptedTokens = [process.env.CRON_SECRET, process.env.CRON_API_TOKEN].filter(
    (value): value is string => Boolean(value)
  );

  if (acceptedTokens.length === 0) {
    return {
      ok: true,
      status: 200,
      mode: "open",
      reason: "No cron token configured. Route remains open for local validation.",
      tokenSource: "missing",
      acceptedHeaderNames: ["authorization", "x-cron-token"]
    };
  }

  const { token, tokenSource } = readCronToken(request);
  const authorized = acceptedTokens.includes(token);

  return {
    ok: authorized,
    status: authorized ? 200 : 401,
    mode: authorized ? "authorized" : "unauthorized",
    reason: authorized ? "Cron request authorized." : "Invalid cron token.",
    tokenSource,
    acceptedHeaderNames: ["authorization", "x-cron-token"]
  };
}
