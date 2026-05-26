create table if not exists public.browser_tasks (
  id uuid primary key default gen_random_uuid(),
  task_type text not null,
  task_prompt text not null,
  target text not null default 'web',
  priority text not null default 'normal',
  approved boolean not null default false,
  safe boolean not null default false,
  state text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.browser_claims (
  id uuid primary key default gen_random_uuid(),
  task_ref uuid references public.browser_tasks(id) on delete cascade,
  worker text not null,
  claimed_at timestamptz not null default now(),
  status text not null default 'claimed'
);

create table if not exists public.browser_evidence (
  id uuid primary key default gen_random_uuid(),
  task_ref uuid references public.browser_tasks(id) on delete set null,
  claim_ref uuid references public.browser_claims(id) on delete set null,
  status text not null,
  evidence text,
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.browser_blockers (
  id uuid primary key default gen_random_uuid(),
  task_ref uuid references public.browser_tasks(id) on delete set null,
  blocker text not null,
  severity text not null default 'medium',
  state text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.browser_screenshots (
  id uuid primary key default gen_random_uuid(),
  task_ref uuid references public.browser_tasks(id) on delete set null,
  screenshot_ref text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.web_research_bridge (
  id uuid primary key default gen_random_uuid(),
  task_prompt text not null,
  status text not null default 'queued',
  evidence text,
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.social_media_bridge (
  id uuid primary key default gen_random_uuid(),
  content_draft text not null,
  channel text not null default 'general',
  approved boolean not null default false,
  publish_safe boolean not null default false,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.lead_generation_bridge (
  id uuid primary key default gen_random_uuid(),
  lead_name text,
  lead_url text,
  score numeric(6,2) not null default 0,
  evidence text,
  outreach_approved boolean not null default false,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.financial_simulation_bridge (
  id uuid primary key default gen_random_uuid(),
  scenario text not null,
  assumptions jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  confidence numeric(6,2) not null default 0,
  recommended_action text,
  created_at timestamptz not null default now()
);

create table if not exists public.shopify_commerce_bridge (
  id uuid primary key default gen_random_uuid(),
  signal text not null,
  revenue_attribution numeric(12,2) not null default 0,
  mutation_requested boolean not null default false,
  approved boolean not null default false,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.approval_queue (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  reason text not null,
  risk_score numeric(6,2) not null default 0,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.escalation_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  severity text not null default 'high',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.rollback_requests (
  id uuid primary key default gen_random_uuid(),
  target text not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.capability_router_bridge (
  id uuid primary key default gen_random_uuid(),
  task_type text not null,
  bridge text not null,
  authority_level text not null default 'safe',
  risk_score numeric(6,2) not null default 0,
  expected_profit_score numeric(6,2) not null default 0,
  required_evidence text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_registry_watchdog (
  id uuid primary key default gen_random_uuid(),
  worker_name text not null,
  stale boolean not null default false,
  last_heartbeat timestamptz not null default now(),
  workaround_task text,
  created_at timestamptz not null default now()
);
