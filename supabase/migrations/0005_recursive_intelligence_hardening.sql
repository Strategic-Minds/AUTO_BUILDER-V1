create table if not exists public.capability_gap_registry (
  id uuid primary key default gen_random_uuid(),
  capability text not null,
  gap_score numeric(6,2) not null default 0,
  evidence text,
  created_at timestamptz not null default now()
);

create table if not exists public.profit_score_registry (
  id uuid primary key default gen_random_uuid(),
  workflow text not null,
  profit_score numeric(6,2) not null default 0,
  rationale text,
  created_at timestamptz not null default now()
);

create table if not exists public.recursive_memory_compression (
  id uuid primary key default gen_random_uuid(),
  memory_key text not null,
  compressed_summary text not null,
  trace_ref uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.blocker_classifier (
  id uuid primary key default gen_random_uuid(),
  blocker_text text not null,
  severity text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.next_task_ranker (
  id uuid primary key default gen_random_uuid(),
  task_name text not null,
  profitability numeric(6,2) not null default 0,
  blocker_reduction numeric(6,2) not null default 0,
  capability_gain numeric(6,2) not null default 0,
  runtime_stability numeric(6,2) not null default 0,
  telemetry_health numeric(6,2) not null default 0,
  total_score numeric(6,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_watchdog (
  id uuid primary key default gen_random_uuid(),
  worker text not null,
  stale boolean not null default false,
  heartbeat_age_seconds integer not null default 0,
  action text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.budget_governor (
  id uuid primary key default gen_random_uuid(),
  surface text not null,
  budget_limit integer not null,
  usage_count integer not null default 0,
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.scheduler_verification (
  id uuid primary key default gen_random_uuid(),
  scheduler_name text not null,
  route text not null,
  status text not null,
  proof text,
  created_at timestamptz not null default now()
);

create table if not exists public.recursive_loop_deduper (
  id uuid primary key default gen_random_uuid(),
  loop_hash text not null,
  deduped boolean not null default false,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.approval_gate_escalation_queue (
  id uuid primary key default gen_random_uuid(),
  task_ref text,
  reason text not null,
  risk text not null default 'high',
  status text not null default 'open',
  created_at timestamptz not null default now()
);
