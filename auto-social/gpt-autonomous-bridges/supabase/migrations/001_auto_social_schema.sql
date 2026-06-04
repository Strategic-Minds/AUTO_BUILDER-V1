-- AUTO SOCIAL Supabase schema draft.
-- Source: EDEN SKYE STUDIOS / AUTO SOCIAL / 13-GITHUB-BOOTSTRAP / gpt-autonomous-bridges / supabase / migrations.
-- Status: Git bootstrap only. Do not apply to a live Supabase project without explicit approval.

create table if not exists auto_social_agents (
  id uuid primary key default gen_random_uuid(),
  agent_key text unique not null,
  name text not null,
  autonomy_level int,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists auto_social_avatars (
  id uuid primary key default gen_random_uuid(),
  avatar_key text unique not null,
  name text not null,
  gender text,
  niche text,
  primary_platform text,
  drive_folder_url text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists auto_social_trends (
  id uuid primary key default gen_random_uuid(),
  source_platform text,
  topic text not null,
  opportunity_score numeric default 0,
  status text default 'new',
  discovered_at timestamptz default now()
);

create table if not exists auto_social_content_ideas (
  id uuid primary key default gen_random_uuid(),
  trend_id uuid references auto_social_trends(id),
  avatar_id uuid references auto_social_avatars(id),
  title text,
  hook text,
  target_platform text,
  status text default 'planned',
  created_at timestamptz default now()
);

create table if not exists auto_social_agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_key text,
  workflow_key text,
  run_mode text default 'sandbox',
  status text,
  input jsonb,
  output jsonb,
  error text,
  started_at timestamptz default now(),
  finished_at timestamptz
);

create table if not exists auto_social_approval_requests (
  id uuid primary key default gen_random_uuid(),
  action_key text not null,
  action_summary text,
  requested_by text,
  status text default 'pending',
  request_payload jsonb,
  decision_payload jsonb,
  created_at timestamptz default now(),
  decided_at timestamptz
);

create table if not exists auto_social_tool_receipts (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid references auto_social_agent_runs(id),
  tool_name text not null,
  operation text,
  status text,
  receipt jsonb,
  created_at timestamptz default now()
);
