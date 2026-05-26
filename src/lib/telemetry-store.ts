type TelemetryTable =
  | "agent_heartbeats"
  | "queue_metrics"
  | "execution_traces"
  | "playwright_sessions"
  | "model_invocations"
  | "rollback_events"
  | "worker_states";

type TelemetryInsert = Record<string, string | number | boolean | null | undefined>;

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function telemetryStoreStatus() {
  return {
    configured: Boolean(supabaseUrl && serviceRoleKey),
    urlConfigured: Boolean(supabaseUrl),
    serviceRoleConfigured: Boolean(serviceRoleKey)
  };
}

export async function insertTelemetry(table: TelemetryTable, payload: TelemetryInsert) {
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      mode: "dry_run",
      reason: "Supabase service role environment is not configured.",
      table,
      payload
    };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();

  return {
    ok: response.ok,
    mode: "supabase_rest",
    status: response.status,
    table,
    response: text ? JSON.parse(text) : null
  };
}

export async function readRecentTelemetry(table: TelemetryTable, orderColumn: string, limit = 10) {
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      mode: "dry_run",
      reason: "Supabase service role environment is not configured.",
      table,
      rows: []
    };
  }

  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  url.searchParams.set("select", "*");
  url.searchParams.set("order", `${orderColumn}.desc`);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url, {
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`
    },
    cache: "no-store"
  });

  const text = await response.text();

  return {
    ok: response.ok,
    mode: "supabase_rest",
    status: response.status,
    table,
    rows: text ? JSON.parse(text) : []
  };
}
