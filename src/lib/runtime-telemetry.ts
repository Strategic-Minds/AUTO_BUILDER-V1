export type RuntimeStatus = "verified" | "unverified" | "blocked";

export type TelemetryCard = {
  id: string;
  label: string;
  value: string;
  status: RuntimeStatus;
  detail: string;
};

export type RuntimeTelemetrySnapshot = {
  generatedAt: string;
  environment: "sandbox" | "production";
  verdict: "instrumented" | "needs_runtime_evidence";
  cards: TelemetryCard[];
  requiredTables: string[];
  requiredSignals: string[];
};

export const runtimeTelemetrySchemaSql = `
create table if not exists agent_heartbeats (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  status text not null,
  surface text not null,
  current_task text,
  latency_ms integer default 0,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists queue_metrics (
  id uuid primary key default gen_random_uuid(),
  queue text not null,
  depth integer not null default 0,
  processing integer not null default 0,
  failed integer not null default 0,
  oldest_job_age_seconds integer not null default 0,
  status text not null,
  observed_at timestamptz not null default now()
);

create table if not exists execution_traces (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  operation text not null,
  status text not null,
  evidence text,
  rollback_ref text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists playwright_sessions (
  id uuid primary key default gen_random_uuid(),
  target text not null,
  status text not null,
  last_action_at timestamptz not null default now(),
  screenshot_ref text,
  blocker text
);

create table if not exists model_invocations (
  id uuid primary key default gen_random_uuid(),
  model text not null,
  operation text not null,
  status text not null,
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  cost_usd_estimate numeric(12,6) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists rollback_events (
  id uuid primary key default gen_random_uuid(),
  surface text not null,
  trigger text not null,
  status text not null,
  rollback_target text not null,
  created_at timestamptz not null default now()
);

create table if not exists worker_states (
  id uuid primary key default gen_random_uuid(),
  worker text not null,
  status text not null,
  queue text not null,
  last_run_at timestamptz not null default now(),
  next_run_at timestamptz
);
`;

export function buildRuntimeTelemetrySnapshot(): RuntimeTelemetrySnapshot {
  const hasSupabase = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasPlaywright = Boolean(process.env.PLAYWRIGHT_WORKER_URL || process.env.PLAYWRIGHT_HEARTBEAT_URL);
  const hasModelTelemetry = Boolean(process.env.MODEL_TELEMETRY_ENABLED);

  return {
    generatedAt: new Date().toISOString(),
    environment: process.env.VERCEL_ENV === "production" ? "production" : "sandbox",
    verdict: hasSupabase && hasServiceRole ? "instrumented" : "needs_runtime_evidence",
    requiredTables: [
      "agent_heartbeats",
      "queue_metrics",
      "execution_traces",
      "playwright_sessions",
      "model_invocations",
      "rollback_events",
      "worker_states"
    ],
    requiredSignals: [
      "last agent heartbeat within 120 seconds",
      "queue depth and failed job counts",
      "execution trace with evidence reference",
      "Playwright session heartbeat or blocker reason",
      "model invocation count and cost estimate",
      "rollback event state",
      "worker state and next run timestamp"
    ],
    cards: [
      {
        id: "supabase",
        label: "Supabase telemetry",
        value: hasSupabase ? "configured" : "missing env",
        status: hasSupabase ? "verified" : "unverified",
        detail: hasServiceRole ? "Service role environment variable is present for server-side telemetry writes." : "Add SUPABASE_SERVICE_ROLE_KEY for governed server-side writes."
      },
      {
        id: "heartbeat",
        label: "Agent heartbeat",
        value: hasSupabase ? "schema ready" : "not persisted",
        status: hasSupabase ? "verified" : "blocked",
        detail: "Heartbeat evidence requires rows in agent_heartbeats from each active worker."
      },
      {
        id: "queues",
        label: "Queue metrics",
        value: "schema ready",
        status: "unverified",
        detail: "Queue truth requires producers/workers to publish queue_metrics."
      },
      {
        id: "playwright",
        label: "Playwright sessions",
        value: hasPlaywright ? "worker endpoint configured" : "worker endpoint missing",
        status: hasPlaywright ? "verified" : "blocked",
        detail: "Browser automation proof requires PLAYWRIGHT_WORKER_URL or PLAYWRIGHT_HEARTBEAT_URL."
      },
      {
        id: "model",
        label: "Model telemetry",
        value: hasModelTelemetry ? "enabled" : "not enabled",
        status: hasModelTelemetry ? "verified" : "unverified",
        detail: "Model invocation evidence writes into model_invocations."
      },
      {
        id: "rollback",
        label: "Rollback registry",
        value: "schema ready",
        status: "unverified",
        detail: "Rollback proof requires rollback_events with armed or executed states."
      }
    ]
  };
}
