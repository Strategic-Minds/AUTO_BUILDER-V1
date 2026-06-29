-- AUTO_BUILDER enterprise completion core scaffold
-- Review before applying. Branch/sandbox only until approved.

create table if not exists public.enterprise_manifests (
  id uuid primary key default gen_random_uuid(),
  manifest_key text unique not null,
  manifest_type text not null,
  owner_email text,
  status text default 'draft',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.workflow_schedules (
  id uuid primary key default gen_random_uuid(),
  schedule_key text unique not null,
  workflow_type text not null,
  cron_expression text,
  is_enabled boolean default false,
  lock_key text,
  last_run_at timestamptz,
  next_run_at timestamptz,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.tool_registry (
  id uuid primary key default gen_random_uuid(),
  tool_key text unique not null,
  tool_class text not null,
  allowed_actions text[] default '{}',
  gated_actions text[] default '{}',
  dry_run_available boolean default true,
  rollback_available boolean default false,
  receipt_required boolean default true,
  approval_gate text default 'operator',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.template_registry (
  id uuid primary key default gen_random_uuid(),
  template_key text unique not null,
  template_type text not null,
  business_vertical text,
  status text default 'draft',
  source_path text,
  render_contract jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.quality_evals (
  id uuid primary key default gen_random_uuid(),
  eval_key text not null,
  target_type text not null,
  target_id text,
  status text default 'pending',
  score numeric,
  evidence jsonb default '{}'::jsonb,
  blocker boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.competitive_intel_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text unique not null,
  vertical text not null,
  state text,
  city text,
  competitor_url text,
  status text default 'queued',
  findings jsonb default '{}'::jsonb,
  benchmark_summary text,
  reverse_engineering_brief text,
  created_at timestamptz default now()
);

create table if not exists public.workspace_scaffold_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_key text unique not null,
  workspace_domain text not null,
  requested_by text,
  action_type text not null,
  dry_run boolean default true,
  status text default 'planned',
  evidence jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.enterprise_manifests enable row level security;
alter table public.workflow_schedules enable row level security;
alter table public.tool_registry enable row level security;
alter table public.template_registry enable row level security;
alter table public.quality_evals enable row level security;
alter table public.competitive_intel_runs enable row level security;
alter table public.workspace_scaffold_receipts enable row level security;
