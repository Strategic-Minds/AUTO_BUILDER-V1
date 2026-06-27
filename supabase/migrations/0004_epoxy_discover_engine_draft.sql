-- Draft only. Do not apply to production Supabase until the Epoxy Discover Engine
-- release approval is granted.
--
-- Supabase Data API guidance checked 2026-06-27:
-- bundle explicit GRANT statements with RLS setup. RLS controls row visibility;
-- GRANT controls whether anon/authenticated/service_role can reach the object.

create extension if not exists pgcrypto;

create table if not exists public.epoxy_states (
  state_code text primary key,
  state_name text not null,
  target_competitor_count integer not null default 50,
  discovered_count integer not null default 0,
  status text not null default 'NEW',
  last_run_at timestamptz,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.epoxy_queue (
  job_key text primary key,
  job_type text not null,
  state_code text not null references public.epoxy_states(state_code) on delete cascade,
  status text not null default 'NEW',
  priority integer not null default 100,
  payload_json jsonb not null default '{}'::jsonb,
  attempts integer not null default 0,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.epoxy_competitors (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references public.epoxy_states(state_code) on delete cascade,
  competitor_key text not null,
  name text not null,
  website text,
  city text,
  services text[] not null default array[]::text[],
  categories text[] not null default array[]::text[],
  source text not null,
  evidence_json jsonb not null default '{}'::jsonb,
  verification_status text not null default 'NEEDS_REVIEW',
  confidence_score numeric(5,4) not null default 0,
  notes text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_code, competitor_key)
);

create table if not exists public.epoxy_website_intelligence (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references public.epoxy_competitors(id) on delete cascade,
  url text not null,
  page_type text,
  observed_at timestamptz not null default now(),
  facts_json jsonb not null default '{}'::jsonb,
  raw_excerpt text,
  source text not null default 'discover_engine',
  created_at timestamptz not null default now()
);

create table if not exists public.epoxy_change_detection (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references public.epoxy_competitors(id) on delete cascade,
  signal_type text not null,
  previous_hash text,
  current_hash text,
  summary text not null,
  severity text not null default 'low',
  detected_at timestamptz not null default now(),
  evidence_json jsonb not null default '{}'::jsonb
);

create table if not exists public.epoxy_reconstruction_packets (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid references public.epoxy_competitors(id) on delete set null,
  packet_key text not null unique,
  status text not null default 'DRAFT',
  packet_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.epoxy_run_receipts (
  id uuid primary key default gen_random_uuid(),
  receipt_key text not null unique,
  route text not null,
  mode text not null,
  state_code text,
  production_action_allowed boolean not null default false,
  status text not null default 'CREATED',
  receipt_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.epoxy_failed_jobs (
  id uuid primary key default gen_random_uuid(),
  job_key text,
  state_code text,
  error_class text not null,
  error_message text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_epoxy_queue_runnable on public.epoxy_queue(status, run_after, priority desc);
create index if not exists idx_epoxy_competitors_state on public.epoxy_competitors(state_code, updated_at desc);
create index if not exists idx_epoxy_website_competitor on public.epoxy_website_intelligence(competitor_id, observed_at desc);
create index if not exists idx_epoxy_change_detection_competitor on public.epoxy_change_detection(competitor_id, detected_at desc);
create index if not exists idx_epoxy_receipts_created on public.epoxy_run_receipts(created_at desc);
create index if not exists idx_epoxy_failed_jobs_created on public.epoxy_failed_jobs(created_at desc);

create or replace function public.set_epoxy_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_epoxy_states_updated_at on public.epoxy_states;
create trigger set_epoxy_states_updated_at
before update on public.epoxy_states
for each row execute function public.set_epoxy_updated_at();

drop trigger if exists set_epoxy_queue_updated_at on public.epoxy_queue;
create trigger set_epoxy_queue_updated_at
before update on public.epoxy_queue
for each row execute function public.set_epoxy_updated_at();

drop trigger if exists set_epoxy_competitors_updated_at on public.epoxy_competitors;
create trigger set_epoxy_competitors_updated_at
before update on public.epoxy_competitors
for each row execute function public.set_epoxy_updated_at();

drop trigger if exists set_epoxy_reconstruction_packets_updated_at on public.epoxy_reconstruction_packets;
create trigger set_epoxy_reconstruction_packets_updated_at
before update on public.epoxy_reconstruction_packets
for each row execute function public.set_epoxy_updated_at();

create or replace function public.claim_epoxy_queue_job(p_worker_id text)
returns public.epoxy_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.epoxy_queue%rowtype;
begin
  select *
  into v_job
  from public.epoxy_queue
  where status in ('NEW', 'RETRY')
    and run_after <= now()
  order by priority desc, created_at asc
  for update skip locked
  limit 1;

  if not found then
    return null;
  end if;

  update public.epoxy_queue
  set
    status = 'RUNNING',
    attempts = attempts + 1,
    locked_at = now(),
    locked_by = p_worker_id,
    updated_at = now()
  where job_key = v_job.job_key
  returning * into v_job;

  return v_job;
end;
$$;

alter table public.epoxy_states enable row level security;
alter table public.epoxy_queue enable row level security;
alter table public.epoxy_competitors enable row level security;
alter table public.epoxy_website_intelligence enable row level security;
alter table public.epoxy_change_detection enable row level security;
alter table public.epoxy_reconstruction_packets enable row level security;
alter table public.epoxy_run_receipts enable row level security;
alter table public.epoxy_failed_jobs enable row level security;

revoke all on table
  public.epoxy_states,
  public.epoxy_queue,
  public.epoxy_competitors,
  public.epoxy_website_intelligence,
  public.epoxy_change_detection,
  public.epoxy_reconstruction_packets,
  public.epoxy_run_receipts,
  public.epoxy_failed_jobs
from anon, authenticated, service_role;

grant select on table
  public.epoxy_states,
  public.epoxy_competitors,
  public.epoxy_website_intelligence,
  public.epoxy_change_detection,
  public.epoxy_reconstruction_packets
to authenticated;

grant select, insert, update, delete on table
  public.epoxy_states,
  public.epoxy_queue,
  public.epoxy_competitors,
  public.epoxy_website_intelligence,
  public.epoxy_change_detection,
  public.epoxy_reconstruction_packets,
  public.epoxy_run_receipts,
  public.epoxy_failed_jobs
to service_role;

revoke execute on function public.set_epoxy_updated_at() from public, anon, authenticated;
revoke execute on function public.claim_epoxy_queue_job(text) from public, anon, authenticated;
grant execute on function public.claim_epoxy_queue_job(text) to service_role;

do $$ begin
  create policy "read epoxy states" on public.epoxy_states
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read epoxy competitors" on public.epoxy_competitors
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read epoxy website intelligence" on public.epoxy_website_intelligence
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read epoxy change detection" on public.epoxy_change_detection
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read epoxy reconstruction packets" on public.epoxy_reconstruction_packets
    for select to authenticated using (true);
exception when duplicate_object then null; end $$;

insert into public.epoxy_states (state_code, state_name, target_competitor_count, status)
values
  ('TX', 'Texas', 50, 'SEEDED_DRY_RUN_READY')
on conflict (state_code) do update
set
  state_name = excluded.state_name,
  target_competitor_count = excluded.target_competitor_count,
  status = public.epoxy_states.status;

insert into public.epoxy_queue (job_key, job_type, state_code, status, priority, payload_json)
values
  (
    'EQ-STATE-TX-001',
    'discover_state_competitors',
    'TX',
    'NEW',
    100,
    '{"source":"migration_seed","target_competitor_count":50}'::jsonb
  )
on conflict (job_key) do nothing;
