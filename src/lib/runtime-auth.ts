import { NextRequest } from "next/server";

export function authorizeRuntimeIngest(request: NextRequest) {
  const requiredToken = process.env.RUNTIME_INGEST_TOKEN;

  if (!requiredToken) {
    return {
      ok: false,
      status: 503,
      reason: "RUNTIME_INGEST_TOKEN is not configured."
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

  if (token !== requiredToken) {
    return {
      ok: false,
      status: 401,
      reason: "Invalid runtime ingestion token."
    };
  }

  return {
    ok: true,
    status: 200,
    reason: "authorized"
  };
}
