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

function candidateUrls(apiRoot: string) {
  const root = new URL(apiRoot);
  const origin = `${root.protocol}//${root.host}`;
  return [
    { label: "public_api_workflows", method: "GET", url: `${apiRoot}/workflows?limit=1`, auth: true },
    { label: "public_api_tags", method: "GET", url: `${apiRoot}/tags?limit=1`, auth: true },
    { label: "legacy_rest_workflows", method: "GET", url: `${origin}/rest/workflows?limit=1`, auth: true },
    { label: "healthz", method: "GET", url: `${origin}/healthz`, auth: false },
    { label: "healthz_readiness", method: "GET", url: `${origin}/healthz/readiness`, auth: false }
  ];
}

type ProbeResult = {
  label: string;
  method: string;
  endpoint: string;
  auth_header_sent: boolean;
  ok: boolean;
  status: number;
  status_text: string;
  elapsed_ms: number;
  response_shape: string;
  visible_count?: number;
  has_next_cursor?: boolean;
  error?: string;
};

async function runProbe(candidate: ReturnType<typeof candidateUrls>[number], apiKey: string): Promise<ProbeResult> {
  const startedAt = Date.now();
  const url = new URL(candidate.url);
  const response = await fetch(url, {
    method: candidate.method,
    headers: candidate.auth
      ? { accept: "application/json", "X-N8N-API-KEY": apiKey }
      : { accept: "application/json,text/plain,*/*" },
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
  const data = body && Array.isArray(body.data) ? body.data : undefined;

  return {
    label: candidate.label,
    method: candidate.method,
    endpoint: `${url.pathname}${url.search}`,
    auth_header_sent: candidate.auth,
    ok: response.ok,
    status: response.status,
    status_text: response.statusText,
    elapsed_ms: Date.now() - startedAt,
    response_shape: body ? "json_object" : text ? "text_or_html" : "empty",
    visible_count: data ? data.length : undefined,
    has_next_cursor: Boolean(body && body.nextCursor),
    error: response.ok ? undefined : sanitizeError(text || response.statusText)
  };
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

  const probes: ProbeResult[] = [];
  for (const candidate of candidateUrls(baseUrl)) {
    try {
      probes.push(await runProbe(candidate, apiKey));
    } catch (error) {
      const url = new URL(candidate.url);
      probes.push({
        label: candidate.label,
        method: candidate.method,
        endpoint: `${url.pathname}${url.search}`,
        auth_header_sent: candidate.auth,
        ok: false,
        status: 0,
        status_text: "fetch_error",
        elapsed_ms: 0,
        response_shape: "error",
        error: sanitizeError(error instanceof Error ? error.message : String(error))
      });
    }
  }

  const apiReady = probes.some((probe) => probe.ok && probe.auth_header_sent);
  const hostReachable = probes.some((probe) => probe.ok);

  return NextResponse.json({
    status: apiReady ? "ready" : hostReachable ? "host_reachable_api_blocked" : "blocked",
    mode: "n8n_readiness_dry_run",
    mutation_performed: false,
    secrets_returned: false,
    env_checks: envChecks,
    normalized_api_root_path: new URL(baseUrl).pathname,
    probes,
    interpretation: apiReady
      ? "At least one authenticated n8n read-only API endpoint responded successfully."
      : hostReachable
        ? "The n8n host is reachable, but authenticated API endpoints did not respond successfully. Check API root, API key scope, or n8n public API availability."
        : "The configured n8n host/API root did not return a successful read-only response.",
    approval_gates: [
      "Workflow creation requires separate operator approval.",
      "Workflow activation requires separate operator approval.",
      "Live triggers require separate operator approval."
    ],
    timestamp: new Date().toISOString()
  }, { status: apiReady ? 200 : hostReachable ? 409 : 502 });
}
