-- AUTO_BUILDER Swarm Intelligence Core
create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto;

create table if not exists public.agent_registry (
  id uuid primary key default gen_random_uuid(),
  agent_key text unique not null,
  display_name text not null,
  agent_type text not null check (agent_type in ('base44_apex','gpt','codex','validator','workflow','mcp','human')),
  owner_email text,
  status text not null default 'draft' check (status in ('draft','active','paused','retired')),
  scope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text unique not null,
  title text not null,
  purpose text not null,
  required_skills text[] not null default '{}',
  allowed_actions text[] not null default '{}',
  gated_actions text[] not null default '{}',
  prompt_template text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.agent_templates(id),
  agent_id uuid references public.agent_registry(id),
  instance_key text unique not null,
  assigned_business text,
  assigned_location text,
  assigned_vertical text,
  status text not null default 'draft',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  thread_key text not null,
  from_agent text not null,
  to_agent text not null,
  message_type text not null,
  priority text not null default 'normal',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.swarm_tasks (
  id uuid primary key default gen_random_uuid(),
  task_key text unique not null,
  phase text not null,
  owner_agent text,
  skill_name text,
  status text not null default 'queued',
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  requires_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intelligence_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text unique not null,
  source_type text not null,
  url text,
  drive_file_id text,
  title text,
  library text not null check (library in ('universal_business','epoxy_concrete')),
  trust_level text not null default 'unverified',
  created_at timestamptz not null default now()
);

create table if not exists public.intelligence_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.intelligence_sources(id),
  title text not null,
  summary text,
  category text not null,
  tags text[] not null default '{}',
  confidence numeric not null default 0.5,
  destination_drive_path text,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.intelligence_chunks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.intelligence_items(id),
  chunk_index int not null,
  content text not null,
  embedding extensions.vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_events (
  id uuid primary key default gen_random_uuid(),
  event_key text unique not null,
  agent_key text,
  business_context text,
  memory_type text not null,
  content text not null,
  tags text[] not null default '{}',
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now()
);

create table if not exists public.drive_destinations (
  id uuid primary key default gen_random_uuid(),
  drive_name text not null,
  folder_path text not null,
  library text,
  owner_email text,
  role_policy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text unique not null,
  library text not null,
  source_count int not null default 0,
  item_count int not null default 0,
  chunk_count int not null default 0,
  status text not null default 'queued',
  receipt jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.license_accounts (
  id uuid primary key default gen_random_uuid(),
  account_key text unique not null,
  account_name text not null,
  plan text not null default 'draft',
  status text not null default 'draft',
  owner_email text,
  created_at timestamptz not null default now()
);

alter table public.agent_registry enable row level security;
alter table public.agent_templates enable row level security;
alter table public.agent_instances enable row level security;
alter table public.agent_messages enable row level security;
alter table public.swarm_tasks enable row level security;
alter table public.intelligence_sources enable row level security;
alter table public.intelligence_items enable row level security;
alter table public.intelligence_chunks enable row level security;
alter table public.memory_events enable row level security;
alter table public.drive_destinations enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.license_accounts enable row level security;

-- Policies intentionally omitted for operator review before production apply.
