create extension if not exists pgcrypto;

create table if not exists public.eden_models (
  id uuid primary key default gen_random_uuid(),
  external_key text not null unique,
  display_name text not null,
  cohort text not null,
  age_band text not null,
  persona text not null,
  platform_targets text[] not null default '{}',
  status text not null default 'draft',
  risk_class text not null default 'low',
  source_refs jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_assets (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references public.eden_models(id) on delete set null,
  asset_type text not null,
  provider text not null default 'seed',
  prompt text,
  file_url text,
  storage_path text,
  qa_status text not null default 'draft',
  quarantine_reason text,
  approval_state text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_content_items (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references public.eden_models(id) on delete set null,
  asset_id uuid references public.eden_assets(id) on delete set null,
  platform text not null,
  content_type text not null,
  pillar text not null,
  hook text,
  caption text,
  cta text,
  scheduled_for timestamptz,
  approval_state text not null default 'draft',
  connector_state text not null default 'not_sent',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_engagement_tickets (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  source_url text,
  inbound_text text,
  risk_class text not null default 'medium',
  draft_response text,
  approval_state text not null default 'draft',
  outbound_state text not null default 'locked',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_experiments (
  id uuid primary key default gen_random_uuid(),
  experiment_type text not null,
  hypothesis text not null,
  variants jsonb not null default '[]'::jsonb,
  primary_metric text not null,
  winner_rule text not null,
  status text not null default 'planned',
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  trigger text not null,
  status text not null default 'queued',
  gate text not null default 'autonomous',
  production_action_allowed boolean not null default false,
  logs jsonb not null default '[]'::jsonb,
  reflection jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_memory_entries (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  fact text not null,
  source text not null,
  confidence text not null default 'unverified',
  tags text[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_receipts (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  gate text not null,
  ok boolean not null default false,
  production_action_allowed boolean not null default false,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

create index if not exists eden_models_cohort_idx on public.eden_models(cohort);
create index if not exists eden_assets_model_idx on public.eden_assets(model_id);
create index if not exists eden_content_state_idx on public.eden_content_items(platform, approval_state, connector_state);
create index if not exists eden_engagement_state_idx on public.eden_engagement_tickets(platform, approval_state, outbound_state);
create index if not exists eden_experiments_status_idx on public.eden_experiments(status);
create index if not exists eden_agent_runs_status_idx on public.eden_agent_runs(status);
create index if not exists eden_memory_scope_idx on public.eden_memory_entries(scope, status);
create index if not exists eden_receipts_action_idx on public.eden_receipts(action, created_at desc);

alter table public.eden_models enable row level security;
alter table public.eden_assets enable row level security;
alter table public.eden_content_items enable row level security;
alter table public.eden_engagement_tickets enable row level security;
alter table public.eden_experiments enable row level security;
alter table public.eden_agent_runs enable row level security;
alter table public.eden_memory_entries enable row level security;
alter table public.eden_receipts enable row level security;

create policy "eden authenticated read models" on public.eden_models for select to authenticated using (true);
create policy "eden authenticated read assets" on public.eden_assets for select to authenticated using (true);
create policy "eden authenticated read content" on public.eden_content_items for select to authenticated using (true);
create policy "eden authenticated read engagement" on public.eden_engagement_tickets for select to authenticated using (true);
create policy "eden authenticated read experiments" on public.eden_experiments for select to authenticated using (true);
create policy "eden authenticated read agent runs" on public.eden_agent_runs for select to authenticated using (true);
create policy "eden authenticated read memory" on public.eden_memory_entries for select to authenticated using (true);
create policy "eden authenticated read receipts" on public.eden_receipts for select to authenticated using (true);

create policy "eden service manage models" on public.eden_models for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "eden service manage assets" on public.eden_assets for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "eden service manage content" on public.eden_content_items for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "eden service manage engagement" on public.eden_engagement_tickets for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "eden service manage experiments" on public.eden_experiments for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "eden service manage agent runs" on public.eden_agent_runs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "eden service manage memory" on public.eden_memory_entries for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "eden service manage receipts" on public.eden_receipts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
