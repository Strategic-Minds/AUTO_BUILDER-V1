create extension if not exists pgcrypto;

create table if not exists public.bridge_commands (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'gpt-autobuilder',
  task_type text not null,
  task_prompt text not null,
  target text not null default 'AUTO_BUILDER',
  priority text not null default 'normal',
  approved boolean not null default false,
  safe boolean not null default false,
  blocked_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.bridge_tasks (
  id uuid primary key default gen_random_uuid(),
  command_ref uuid references public.bridge_commands(id) on delete set null,
  task_type text not null,
  task_prompt text not null,
  target text not null default 'AUTO_BUILDER',
  priority text not null default 'normal',
  state text not null default 'queued',
  approved boolean not null default false,
  safe boolean not null default false,
  claimed_by text,
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.bridge_claims (
  id uuid primary key default gen_random_uuid(),
  task_ref uuid references public.bridge_tasks(id) on delete cascade,
  worker text not null,
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'claimed'
);

create table if not exists public.bridge_evidence (
  id uuid primary key default gen_random_uuid(),
  task_ref uuid references public.bridge_tasks(id) on delete set null,
  claim_ref uuid references public.bridge_claims(id) on delete set null,
  worker text not null,
  status text not null,
  evidence text,
  blocker text,
  created_at timestamptz not null default now()
);

create table if not exists public.bridge_blockers (
  id uuid primary key default gen_random_uuid(),
  task_ref uuid references public.bridge_tasks(id) on delete set null,
  blocker text not null,
  state text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.bridge_next_prompts (
  id uuid primary key default gen_random_uuid(),
  task_ref uuid references public.bridge_tasks(id) on delete set null,
  prompt text not null,
  source text not null default 'autobuilder-recursive-control',
  created_at timestamptz not null default now()
);

create index if not exists idx_bridge_tasks_state_created on public.bridge_tasks(state, created_at desc);
create index if not exists idx_bridge_claims_task on public.bridge_claims(task_ref, claimed_at desc);
create index if not exists idx_bridge_evidence_task on public.bridge_evidence(task_ref, created_at desc);
create index if not exists idx_bridge_blockers_state on public.bridge_blockers(state, created_at desc);
create index if not exists idx_bridge_next_prompts_created on public.bridge_next_prompts(created_at desc);
