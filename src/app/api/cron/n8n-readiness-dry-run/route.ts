import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function present(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeN8nApiRoot(raw: string) {
  const parsed = new URL(raw.trim());
  parsed.search = "";
  parsed.hash = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");

  const apiIndex = parsed.pathname.indexOf("/api/v1");
  if (apiIndex >= 0) {
    parsed.pathname = parsed.pathname.slice(0, apiIndex + "/api/v1".length);
    return parsed.toString().replace(/\/+$/, "");
  }

  const removableSuffixes = ["/mcp-server/http", "/webhook-test", "/webhook", "/form", "/rest"];
  for (const suffix of removableSuffixes) {
    const suffixIndex = parsed.pathname.indexOf(suffix);
    if (suffixIndex >= 0) {
      parsed.pathname = parsed.pathname.slice(0, suffixIndex);
      break;
    }
  }

  parsed.pathname = `${parsed.pathname.replace(/\/+$/, "")}/api/v1`;
  return parsed.toString().replace(/\/+$/, "");
}

function getN8nBaseUrl() {
  const raw = process.env.N8N_API_BASE_URL ?? process.env.N8N_SERVER_URL ?? process.env.N8N_BASE_URL ?? process.env.N8N_WEBHOOK_BASE_URL;
  if (!present(raw)) return null;
  try {
    return normalizeN8nApiRoot(raw!);
  } catch {
    return null;
  }
}

function getN8nApiKey() {
  return process.env.N8N_API_KEY ?? process.env.N8N_ACCESS_TOKEN ?? null;
}

function sanitizeError(text: string) {
  return text
    .replace(/n8n_[A-Za-z0-9_\-]+/g, "[redacted_n8n_key]")
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]")
    .slice(0, 500);
}

export async function GET() {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json(
      { status: "blocked", reason: "n8n readiness dry-run route is disabled in production." },
      { status: 403 }
    );
  }

  const baseUrl = getN8nBaseUrl();
  const apiKey = getN8nApiKey();
  const envChecks = {
    server_url_present: baseUrl !== null,
    api_key_present: present(apiKey ?? undefined)
  };

  if (!baseUrl || !apiKey) {
    return NextResponse.json({
      status: "blocked",
      mode: "n8n_readiness_dry_run",
      mutation_performed: false,
      secrets_returned: false,
      env_checks: envChecks,
      reason: "Missing or invalid n8n API base URL or API key env."
    }, { status: 403 });
  }

  const url = new URL(`${baseUrl}/workflows`);
  url.searchParams.set("limit", "1");

  const startedAt = Date.now();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-N8N-API-KEY": apiKey
    },
    cache: "no-store"
  });

  const text = await response.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  const body = parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  const data = body && Array.isArray(body.data) ? body.data : [];

  return NextResponse.json({
    status: response.ok ? "ready" : "blocked",
    mode: "n8n_readiness_dry_run",
    mutation_performed: false,
    secrets_returned: false,
    env_checks: envChecks,
    request: {
      method: "GET",
      endpoint: "/api/v1/workflows",
      limit: 1
    },
    response: {
      ok: response.ok,
      status: response.status,
      status_text: response.statusText,
      workflow_count_visible: data.length,
      has_next_cursor: Boolean(body && body.nextCursor),
      elapsed_ms: Date.now() - startedAt
    },
    error: response.ok ? undefined : sanitizeError(text || response.statusText),
    approval_gates: [
      "Workflow creation requires separate operator approval.",
      "Workflow activation requires separate operator approval.",
      "Live triggers require separate operator approval."
    ],
    timestamp: new Date().toISOString()
  }, { status: response.ok ? 200 : 502 });
}
