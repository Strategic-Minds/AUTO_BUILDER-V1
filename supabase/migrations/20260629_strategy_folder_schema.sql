-- AUTO_BUILDER Strategy Folder — Supabase Migration
-- Branch: feature/strategy-folder-gpt-agent-bootstrap
-- Status: STAGED ONLY — do NOT apply to production without Jeremy approval
-- Created: 2026-06-29
-- Operator: jeremy@autobuilderos.com
-- 
-- To apply to staging:
--   supabase db push --project-ref prhppuuwcnmfdhwsagug --db-url <STAGING_URL>
-- To apply to production: REQUIRES explicit Jeremy GO signal

-- AUTO_BUILDER Strategy Folder + GPT Agent Handoff schema patch
-- Staging-first. Review before applying to production.

create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  plan text default 'internal',
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  project_name text not null,
  business_name text,
  industry text,
  current_phase text default 'FORM',
  current_gate text default 'intake_required',
  drive_root_id text,
  github_repo text,
  github_branch text,
  vercel_project_id text,
  supabase_project_ref text,
  status text default 'queued',
  score numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists project_queue (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  queue_name text not null,
  priority int default 50,
  status text default 'queued',
  locked_by text,
  locked_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  doc_type text not null,
  drive_path text,
  file_id text,
  status text default 'draft',
  content_hash text,
  created_at timestamptz default now()
);

create table if not exists form_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  form_type text not null,
  respondent_email text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  approval_type text not null,
  approved boolean,
  approved_by text,
  requested_changes text,
  revision_count int default 0,
  receipt_id uuid,
  created_at timestamptz default now()
);

create table if not exists competitor_benchmarks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  competitor_name text,
  url text,
  selection_reason text,
  public_signals jsonb default '{}'::jsonb,
  benchmark_score numeric,
  legal_notes text,
  created_at timestamptz default now()
);

create table if not exists agent_registry (
  id uuid primary key default gen_random_uuid(),
  agent_key text unique not null,
  display_name text not null,
  agent_type text not null,
  owner_email text,
  allowed_actions jsonb default '[]'::jsonb,
  gated_actions jsonb default '[]'::jsonb,
  memory_scope text default 'tenant',
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists agent_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  from_agent text,
  to_agent text,
  channel text,
  message_type text,
  payload jsonb default '{}'::jsonb,
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists memory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  library text,
  title text,
  content text,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  confidence numeric default 0.5,
  created_at timestamptz default now()
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  receipt_type text not null,
  status text not null,
  summary text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists qa_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  stage text not null,
  score numeric default 0,
  status text default 'pending',
  artifacts jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists auto_heal_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  iteration int default 0,
  diagnosis text,
  patch_branch text,
  status text default 'planned',
  blockers jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists communication_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  channel text not null,
  direction text not null,
  recipient text,
  subject text,
  message_template text,
  status text default 'draft',
  approval_id uuid,
  consent_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists social_posts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  provider text default 'buffer',
  channel_id text,
  post_status text default 'draft',
  scheduled_at timestamptz,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table tenants enable row level security;
alter table projects enable row level security;
alter table project_queue enable row level security;
alter table project_documents enable row level security;
alter table form_submissions enable row level security;
alter table approvals enable row level security;
alter table competitor_benchmarks enable row level security;
alter table agent_registry enable row level security;
alter table agent_messages enable row level security;
alter table memory_items enable row level security;
alter table receipts enable row level security;
alter table qa_runs enable row level security;
alter table auto_heal_runs enable row level security;
alter table communication_events enable row level security;
alter table social_posts enable row level security;

-- Policies must be replaced with project-specific tenant/auth logic before production.

