type TelemetryTable =
  | "agent_heartbeats"
  | "queue_metrics"
  | "execution_traces"
  | "playwright_sessions"
  | "model_invocations"
  | "rollback_events"
  | "worker_states"
  | "bridge_commands"
  | "bridge_tasks"
  | "bridge_claims"
  | "bridge_evidence"
  | "bridge_blockers"
  | "bridge_next_prompts";

type TelemetryInsert = Record<string, string | number | boolean | null | undefined>;
type TelemetryRow = Record<string, unknown>;

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

export async function readTelemetryByQuery(table: TelemetryTable, query: Record<string, string>) {
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
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

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

export async function updateTelemetry(table: TelemetryTable, payload: TelemetryInsert, filters: Record<string, string>) {
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      mode: "dry_run",
      reason: "Supabase service role environment is not configured.",
      table,
      payload
    };
  }

  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(filters)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    method: "PATCH",
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

export type RuntimeEvidenceSnapshot = {
  available: boolean;
  rows: {
    playwrightSession: TelemetryRow | null;
    heartbeat: TelemetryRow | null;
    queueMetric: TelemetryRow | null;
  };
  recencySeconds: {
    playwrightSession: number | null;
    heartbeat: number | null;
    queueMetric: number | null;
  };
};

function parseIsoDate(value: unknown): number | null {
  if (typeof value !== "string") {
    return null;
  }
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}

function ageSeconds(isoDate: unknown): number | null {
  const ms = parseIsoDate(isoDate);
  if (ms === null) {
    return null;
  }
  return Math.max(0, Math.floor((Date.now() - ms) / 1000));
}

export async function readRuntimeEvidence(limit = 1): Promise<RuntimeEvidenceSnapshot> {
  const [playwrightSessions, heartbeats, queueMetrics] = await Promise.all([
    readRecentTelemetry("playwright_sessions", "last_action_at", limit),
    readRecentTelemetry("agent_heartbeats", "last_seen_at", limit),
    readRecentTelemetry("queue_metrics", "observed_at", limit)
  ]);

  if (!playwrightSessions.ok || !heartbeats.ok || !queueMetrics.ok) {
    return {
      available: false,
      rows: {
        playwrightSession: null,
        heartbeat: null,
        queueMetric: null
      },
      recencySeconds: {
        playwrightSession: null,
        heartbeat: null,
        queueMetric: null
      }
    };
  }

  const latestPlaywright = (playwrightSessions.rows[0] as TelemetryRow | undefined) ?? null;
  const latestHeartbeat = (heartbeats.rows[0] as TelemetryRow | undefined) ?? null;
  const latestQueueMetric = (queueMetrics.rows[0] as TelemetryRow | undefined) ?? null;

  return {
    available: true,
    rows: {
      playwrightSession: latestPlaywright,
      heartbeat: latestHeartbeat,
      queueMetric: latestQueueMetric
    },
    recencySeconds: {
      playwrightSession: ageSeconds(latestPlaywright?.last_action_at),
      heartbeat: ageSeconds(latestHeartbeat?.last_seen_at),
      queueMetric: ageSeconds(latestQueueMetric?.observed_at)
    }
  };
}
