import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const BRIDGE_PHASES = ["discovery", "plan", "brand", "approval", "build", "deploy", "social"] as const;
export const BRIDGE_STATUSES = ["pending", "success", "failed", "retry"] as const;
export const BRIDGE_AUTH_TYPES = ["hmac", "api_key"] as const;

type BridgePhase = (typeof BRIDGE_PHASES)[number];
type BridgeStatus = (typeof BRIDGE_STATUSES)[number];
type BridgeAuthType = (typeof BRIDGE_AUTH_TYPES)[number];

export type BridgeEventInput = {
  id?: string;
  source_event_id?: string;
  phase?: string;
  source_system?: string;
  target_system?: string;
  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type BridgeConnectionInput = {
  system_name?: string;
  webhook_url?: string;
  auth_type?: string;
  metadata?: Record<string, unknown>;
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function bridgeEventBusStatus() {
  return {
    configured: Boolean(supabaseUrl && serviceRoleKey),
    urlConfigured: Boolean(supabaseUrl),
    serviceRoleConfigured: Boolean(serviceRoleKey),
    inboundSecretConfigured: Boolean(bridgeSecret()),
    eventWritesEnabled: writesEnabled(),
    outboundDispatchEnabled: outboundEnabled(),
    secretsExposed: false
  };
}

export function bridgeSecret() {
  return process.env.BRIDGE_SECRET || process.env.AUTO_BUILDER_BRIDGE_TOKEN || process.env.ADMIN_API_TOKEN || process.env.BRIDGE_API_KEY || "";
}

export function bearerAuthorized(request: Request) {
  const secret = bridgeSecret();
  if (!secret) return false;
  return (request.headers.get("authorization") || "") === `Bearer ${secret}`;
}

function normalizeSignature(value: string) {
  return value.replace(/^sha256=/, "").trim();
}

export function signBridgePayload(rawBody: string, secret = bridgeSecret()) {
  if (!secret) return "";
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function hmacAuthorized(request: Request, rawBody: string) {
  const secret = bridgeSecret();
  if (!secret) return false;
  const supplied = normalizeSignature(request.headers.get("x-awos-signature") || request.headers.get("x-bridge-signature") || "");
  if (!supplied) return false;
  const expected = signBridgePayload(rawBody, secret);

  try {
    const suppliedBuffer = Buffer.from(supplied, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export function signedOrBearerAuthorized(request: Request, rawBody = "") {
  return bearerAuthorized(request) || (rawBody ? hmacAuthorized(request, rawBody) : false);
}

export function validateBridgeEvent(body: BridgeEventInput) {
  const errors: string[] = [];
  if (!body.phase || !BRIDGE_PHASES.includes(body.phase as BridgePhase)) errors.push("invalid_phase");
  if (!body.source_system) errors.push("source_system_required");
  if (!body.target_system) errors.push("target_system_required");
  if (body.payload !== undefined && (typeof body.payload !== "object" || Array.isArray(body.payload) || body.payload === null)) errors.push("payload_must_be_object");
  return errors;
}

export function validateConnection(body: BridgeConnectionInput) {
  const errors: string[] = [];
  if (!body.system_name) errors.push("system_name_required");
  if (!body.webhook_url) errors.push("webhook_url_required");
  if (body.auth_type && !BRIDGE_AUTH_TYPES.includes(body.auth_type as BridgeAuthType)) errors.push("invalid_auth_type");
  if (body.webhook_url) {
    try {
      const url = new URL(body.webhook_url);
      if (!["https:", "http:"].includes(url.protocol)) errors.push("webhook_url_protocol_invalid");
    } catch {
      errors.push("webhook_url_invalid");
    }
  }
  return errors;
}

export function writesEnabled() {
  return process.env.BRIDGE_EVENT_WRITE_ENABLED === "true" || process.env.AUTO_BUILDER_ADMIN_WRITE_ENABLED === "true";
}

export function outboundEnabled() {
  return process.env.BRIDGE_OUTBOUND_DISPATCH_ENABLED === "true";
}

async function supabaseRest(path: string, init: RequestInit = {}) {
  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false, mode: "dry_run", reason: "supabase_service_role_env_missing", status: 0, data: null };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.method && init.method !== "GET" ? { prefer: "return=representation" } : {}),
      ...(init.headers || {})
    },
    cache: "no-store"
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: response.ok, mode: "supabase_rest", status: response.status, data };
}

export async function insertBridgeEvent(body: BridgeEventInput, status: BridgeStatus = "pending") {
  const now = new Date().toISOString();
  const payload = {
    id: body.id || randomUUID(),
    source_event_id: body.source_event_id || null,
    phase: body.phase,
    source_system: body.source_system,
    target_system: body.target_system,
    payload: body.payload || {},
    metadata: body.metadata || {},
    status,
    retry_count: 0,
    created_at: now,
    updated_at: now
  };

  if (!writesEnabled()) return { ok: false, mode: "dry_run", reason: "bridge_event_writes_disabled", data: [payload] };
  return supabaseRest("bridge_events", { method: "POST", body: JSON.stringify(payload) });
}

export async function readBridgeEvents(params: URLSearchParams) {
  const limit = Math.min(Number(params.get("limit") || 50), 200);
  const query = new URLSearchParams({ select: "*", order: "created_at.desc", limit: String(limit) });
  for (const [key, column] of [["phase", "phase"], ["source", "source_system"], ["target", "target_system"], ["status", "status"]]) {
    const value = params.get(key);
    if (value) query.set(column, `eq.${value}`);
  }
  return supabaseRest(`bridge_events?${query}`);
}

export async function readBridgeConnections(includeInactive = false) {
  const query = new URLSearchParams({ select: "*", order: "system_name.asc" });
  if (!includeInactive) query.set("active", "eq.true");
  return supabaseRest(`bridge_connections?${query}`);
}

export async function registerBridgeConnection(body: BridgeConnectionInput) {
  const payload = {
    system_name: body.system_name,
    webhook_url: body.webhook_url,
    auth_type: body.auth_type || "hmac",
    health_status: "degraded",
    active: true,
    metadata: body.metadata || {}
  };
  if (!writesEnabled()) return { ok: false, mode: "dry_run", reason: "bridge_event_writes_disabled", data: [payload] };
  return supabaseRest("bridge_connections?on_conflict=system_name", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload)
  });
}

export async function findBridgeConnection(systemName: string) {
  const query = new URLSearchParams({ select: "*", system_name: `eq.${systemName}`, active: "eq.true", limit: "1" });
  const result = await supabaseRest(`bridge_connections?${query}`);
  const rows = Array.isArray(result.data) ? result.data : [];
  return { ...result, connection: rows[0] as Record<string, unknown> | undefined };
}

export async function readRetryableBridgeEvents(limit = 10) {
  const query = new URLSearchParams({ select: "*", status: "in.(failed,retry)", order: "updated_at.asc", limit: String(Math.min(limit, 50)) });
  return supabaseRest(`bridge_events?${query}`);
}

export function publicConnection(row: Record<string, unknown>, revealUrl = false) {
  let maskedWebhookUrl = null;
  if (typeof row?.webhook_url === "string") {
    try {
      const url = new URL(row.webhook_url);
      maskedWebhookUrl = revealUrl ? row.webhook_url : `${url.origin}/...`;
    } catch {
      maskedWebhookUrl = revealUrl ? row.webhook_url : "configured";
    }
  }
  return {
    id: row?.id,
    system_name: row?.system_name,
    webhook_url: revealUrl ? row?.webhook_url : undefined,
    masked_webhook_url: maskedWebhookUrl,
    auth_type: row?.auth_type,
    health_status: row?.health_status,
    last_ping: row?.last_ping,
    last_latency_ms: row?.last_latency_ms,
    active: row?.active,
    metadata: row?.metadata || {},
    created_at: row?.created_at,
    updated_at: row?.updated_at
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function dispatchToConnection(targetSystem: string, body: Record<string, unknown>, retries = 5) {
  const lookup = await findBridgeConnection(targetSystem);
  if (!lookup.ok) return { ok: false, reason: "connection_lookup_failed", lookup };
  if (!lookup.connection) return { ok: false, reason: "target_connection_not_found", targetSystem };
  if (!outboundEnabled()) return { ok: false, reason: "outbound_dispatch_disabled", targetSystem };

  const webhookUrl = String(lookup.connection.webhook_url || "");
  const rawBody = JSON.stringify(body);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (lookup.connection.auth_type === "hmac") headers["x-awos-signature"] = `sha256=${signBridgePayload(rawBody)}`;
  if (lookup.connection.auth_type === "api_key" && process.env.BRIDGE_OUTBOUND_API_KEY) headers.authorization = `Bearer ${process.env.BRIDGE_OUTBOUND_API_KEY}`;

  let lastError = "unknown_dispatch_error";
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const started = Date.now();
    try {
      const response = await fetch(webhookUrl, { method: "POST", headers, body: rawBody });
      const text = await response.text();
      const latency = Date.now() - started;
      if (response.ok) return { ok: true, status: response.status, latency_ms: latency, response: text.slice(0, 1000), attempts: attempt + 1 };
      lastError = `http_${response.status}:${text.slice(0, 500)}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await sleep(Math.min(16000, 1000 * 2 ** attempt));
  }
  return { ok: false, reason: lastError, attempts: retries };
}
