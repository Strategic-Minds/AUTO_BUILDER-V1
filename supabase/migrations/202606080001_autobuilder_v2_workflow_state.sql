create table if not exists public.autobuilder_v2_queue (
  id text primary key,
  source_item_id text,
  action text not null,
  status text not null default 'queued',
  blocker_class text,
  description text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.autobuilder_v2_receipts (
  id text primary key,
  provider text not null,
  action text not null,
  category text not null,
  status text not null,
  ok boolean not null default false,
  receipt jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.autobuilder_v2_pipeline_state (
  id text primary key,
  phase text not null,
  step text,
  status text not null,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.autobuilder_v2_project_records (
  id text primary key,
  name text not null,
  project_type text not null,
  phase text not null default 'PLAN',
  repo text,
  drive_folder text,
  vercel_project text,
  shopify_store text,
  deployment_url text,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists autobuilder_v2_queue_status_idx on public.autobuilder_v2_queue(status);
create index if not exists autobuilder_v2_receipts_provider_action_idx on public.autobuilder_v2_receipts(provider, action);
