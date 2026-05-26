create extension if not exists pgcrypto;

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'chat',
  raw_text text not null,
  submitted_by text not null default 'operator',
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table if not exists public.build_cards (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.ideas(id) on delete set null,
  route text not null,
  risk text not null default 'medium',
  status text not null default 'draft',
  estimate_minutes integer not null default 60,
  packet_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id text primary key,
  pack text not null,
  version text not null,
  status text not null default 'draft',
  reuse_score integer not null default 0,
  modules_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.template_assets (
  id uuid primary key default gen_random_uuid(),
  template_id text references public.templates(id) on delete cascade,
  asset_type text not null,
  path text not null,
  checksum text,
  meta_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agents (
  id text primary key,
  name text not null,
  tools jsonb not null default '[]'::jsonb,
  autonomy_level integer not null default 0,
  approval_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id text references public.agents(id) on delete set null,
  input_json jsonb not null default '{}'::jsonb,
  output_json jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  cost_usd numeric(10,4) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.queues (
  id text primary key,
  purpose text not null,
  retry_policy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  queue_id text references public.queues(id) on delete cascade,
  payload_json jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  attempts integer not null default 0,
  run_after timestamptz not null default now(),
  dead_letter_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tool_receipts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete set null,
  connector text not null,
  action text not null,
  response_hash text,
  receipt_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  object_type text not null,
  object_id text not null,
  risk text not null,
  status text not null default 'needs_review',
  requested_by text not null default 'system',
  approver text,
  evidence_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ideas_created_at on public.ideas(created_at desc);
create index if not exists idx_build_cards_status on public.build_cards(status);
create index if not exists idx_jobs_queue_status on public.jobs(queue_id, status, run_after);
create index if not exists idx_agent_runs_status on public.agent_runs(status, created_at desc);
create index if not exists idx_approval_requests_status on public.approval_requests(status, risk);

alter table public.ideas enable row level security;
alter table public.build_cards enable row level security;
alter table public.templates enable row level security;
alter table public.template_assets enable row level security;
alter table public.agents enable row level security;
alter table public.agent_runs enable row level security;
alter table public.queues enable row level security;
alter table public.jobs enable row level security;
alter table public.tool_receipts enable row level security;
alter table public.approval_requests enable row level security;

do $$ begin
  create policy "read ideas" on public.ideas for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read build_cards" on public.build_cards for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read templates" on public.templates for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read template_assets" on public.template_assets for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read agents" on public.agents for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read agent_runs" on public.agent_runs for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read queues" on public.queues for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read jobs" on public.jobs for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read tool_receipts" on public.tool_receipts for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "read approval_requests" on public.approval_requests for select to authenticated using (true);
exception when duplicate_object then null; end $$;

insert into public.queues (id, purpose, retry_policy)
values
  ('idea_intake_queue', 'capture and classify inbound ideas', '{"tries":3,"mode":"exponential"}'),
  ('build_router_queue', 'route ideas into build cards', '{"tries":3,"mode":"exponential"}'),
  ('template_pull_queue', 'assemble reusable template bundles', '{"tries":2,"mode":"fixed"}'),
  ('repo_patch_queue', 'prepare code patch or branch changes', '{"tries":2,"mode":"fixed"}'),
  ('supabase_migration_queue', 'run sandbox schema migrations', '{"tries":2,"mode":"fixed"}'),
  ('vercel_preview_queue', 'deploy preview builds', '{"tries":2,"mode":"fixed"}'),
  ('hardening_queue', 'run hardening and preview validation', '{"tries":3,"mode":"exponential"}'),
  ('approval_queue', 'manage human approvals', '{"tries":1,"mode":"none"}'),
  ('asset_factory_queue', 'capture reusable outputs', '{"tries":2,"mode":"fixed"}')
on conflict (id) do nothing;

insert into public.agents (id, name, tools, autonomy_level, approval_rules)
values
  ('intake-agent', 'Intake Agent', '["router"]', 8, '{"live_writes":false}'),
  ('router-agent', 'Router Agent', '["routing","template_selection"]', 8, '{"high_risk_requires_approval":true}'),
  ('builder-agent', 'Builder Agent', '["codex","github","vercel"]', 9, '{"production_requires_approval":true}'),
  ('qa-agent', 'QA Agent', '["playwright","api_tests"]', 9, '{"release_gate":true}')
on conflict (id) do nothing;
