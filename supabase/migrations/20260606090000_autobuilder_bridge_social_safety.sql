-- AUTO BUILDER OS v1 bridge/social safety migration
-- Branch-safe migration for Supabase preview/development branches first.
-- Do not apply to production until advisor evidence and operator approval are recorded.

create extension if not exists pgcrypto;

create or replace function public.bridge_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.bridge_events (
  id uuid primary key default gen_random_uuid(),
  source_event_id text,
  phase text not null check (phase in ('discovery', 'plan', 'brand', 'approval', 'build', 'deploy', 'social')),
  source_system text not null,
  target_system text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'retry')),
  error_message text,
  retry_count integer not null default 0 check (retry_count >= 0),
  max_retries integer not null default 5 check (max_retries >= 0 and max_retries <= 10),
  next_retry_at timestamptz,
  dispatched_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, source_event_id)
);

create table if not exists public.bridge_connections (
  id uuid primary key default gen_random_uuid(),
  system_name text not null unique,
  webhook_url text not null,
  auth_type text not null default 'hmac' check (auth_type in ('hmac', 'api_key')),
  health_status text not null default 'degraded' check (health_status in ('healthy', 'degraded', 'down')),
  last_ping timestamptz,
  last_latency_ms integer,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bridge_credentials (
  id uuid primary key default gen_random_uuid(),
  system_name text not null references public.bridge_connections(system_name) on update cascade on delete cascade,
  key_type text not null,
  vault_secret_id uuid,
  encrypted_value text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (system_name, key_type)
);

create table if not exists public.social_projects (
  id uuid primary key default gen_random_uuid(),
  system_id text not null,
  source_system text not null default 'auto_builder',
  status text not null default 'draft',
  approval_status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_calendar_items (
  id uuid primary key default gen_random_uuid(),
  system_id text not null,
  source_system text not null default 'auto_builder',
  status text not null default 'draft',
  approval_status text not null default 'pending',
  platform text,
  scheduled_for timestamptz,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_assets (
  id uuid primary key default gen_random_uuid(),
  system_id text not null,
  source_system text not null default 'auto_builder',
  status text not null default 'draft',
  approval_status text not null default 'pending',
  asset_type text,
  provider text,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_approval_requests (
  id uuid primary key default gen_random_uuid(),
  system_id text not null,
  source_system text not null default 'auto_builder',
  status text not null default 'pending',
  approval_status text not null default 'pending',
  requested_action text not null,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_bridge_events (
  id uuid primary key default gen_random_uuid(),
  system_id text not null,
  source_system text not null default 'auto_builder',
  status text not null default 'pending',
  approval_status text not null default 'not_required',
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_dead_letters (
  id uuid primary key default gen_random_uuid(),
  system_id text,
  source_system text not null default 'auto_builder',
  status text not null default 'open',
  approval_status text not null default 'blocked',
  error_message text not null,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bridge_events_phase_status_created_idx on public.bridge_events (phase, status, created_at desc);
create index if not exists bridge_events_retry_idx on public.bridge_events (status, next_retry_at, retry_count) where status in ('failed', 'retry');
create index if not exists bridge_connections_active_idx on public.bridge_connections (active, health_status);
create index if not exists social_calendar_items_system_status_idx on public.social_calendar_items (system_id, status, scheduled_for);
create index if not exists social_assets_system_status_idx on public.social_assets (system_id, status, provider);
create index if not exists social_bridge_events_system_created_idx on public.social_bridge_events (system_id, created_at desc);

create or replace trigger bridge_events_set_updated_at
before update on public.bridge_events
for each row execute function public.bridge_set_updated_at();

create or replace trigger bridge_connections_set_updated_at
before update on public.bridge_connections
for each row execute function public.bridge_set_updated_at();

create or replace trigger bridge_credentials_set_updated_at
before update on public.bridge_credentials
for each row execute function public.bridge_set_updated_at();

create or replace trigger social_projects_set_updated_at
before update on public.social_projects
for each row execute function public.bridge_set_updated_at();

create or replace trigger social_calendar_items_set_updated_at
before update on public.social_calendar_items
for each row execute function public.bridge_set_updated_at();

create or replace trigger social_assets_set_updated_at
before update on public.social_assets
for each row execute function public.bridge_set_updated_at();

create or replace trigger social_approval_requests_set_updated_at
before update on public.social_approval_requests
for each row execute function public.bridge_set_updated_at();

create or replace trigger social_bridge_events_set_updated_at
before update on public.social_bridge_events
for each row execute function public.bridge_set_updated_at();

create or replace trigger social_dead_letters_set_updated_at
before update on public.social_dead_letters
for each row execute function public.bridge_set_updated_at();

create or replace function public.bridge_touch_connection_from_event()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.bridge_connections
  set last_ping = now(), updated_at = now()
  where system_name = new.source_system;
  return new;
end;
$$;

create or replace trigger bridge_events_touch_source_connection
after insert on public.bridge_events
for each row execute function public.bridge_touch_connection_from_event();

alter table public.bridge_events enable row level security;
alter table public.bridge_connections enable row level security;
alter table public.bridge_credentials enable row level security;
alter table public.social_projects enable row level security;
alter table public.social_calendar_items enable row level security;
alter table public.social_assets enable row level security;
alter table public.social_approval_requests enable row level security;
alter table public.social_bridge_events enable row level security;
alter table public.social_dead_letters enable row level security;

drop policy if exists bridge_events_authenticated_own_read on public.bridge_events;
create policy bridge_events_authenticated_own_read
on public.bridge_events
for select
to authenticated
using (coalesce(auth.jwt() -> 'app_metadata' ->> 'bridge_system', '') in (source_system, target_system));

drop policy if exists bridge_connections_authenticated_health_read on public.bridge_connections;
create policy bridge_connections_authenticated_health_read
on public.bridge_connections
for select
to authenticated
using (active = true);

drop policy if exists social_projects_authenticated_project_read on public.social_projects;
create policy social_projects_authenticated_project_read
on public.social_projects
for select
to authenticated
using (true);

drop policy if exists social_calendar_items_authenticated_project_read on public.social_calendar_items;
create policy social_calendar_items_authenticated_project_read
on public.social_calendar_items
for select
to authenticated
using (true);

drop policy if exists social_assets_authenticated_project_read on public.social_assets;
create policy social_assets_authenticated_project_read
on public.social_assets
for select
to authenticated
using (true);

drop policy if exists social_approval_requests_authenticated_project_read on public.social_approval_requests;
create policy social_approval_requests_authenticated_project_read
on public.social_approval_requests
for select
to authenticated
using (true);

drop policy if exists social_bridge_events_authenticated_project_read on public.social_bridge_events;
create policy social_bridge_events_authenticated_project_read
on public.social_bridge_events
for select
to authenticated
using (true);

drop policy if exists social_dead_letters_authenticated_project_read on public.social_dead_letters;
create policy social_dead_letters_authenticated_project_read
on public.social_dead_letters
for select
to authenticated
using (true);

-- Add service-role-only policies for advisor-visible runtime tables that intentionally have no public writes.
do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    '_autobuilder_probe','agent_heartbeats','ai_tasks','ai_execution_logs','ai_system_events','ai_revenue_events','ai_content_queue','ai_model_runs','ai_guardrail_events','ai_approval_queue','bridge_commands','bridge_tasks','bridge_claims','bridge_evidence','bridge_blockers','bridge_next_prompts','browser_tasks','browser_claims','browser_evidence','browser_blockers','browser_screenshots','queue_metrics','execution_traces','playwright_sessions','model_invocations','worker_states','notification_bridge','worker_heartbeats','social_media_bridge','shopify_commerce_bridge','web_research_bridge','lead_generation_bridge','financial_simulation_bridge','rollback_events','rollback_requests','scheduler_verification'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      policy_name := table_name || '_service_role_all';
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
      execute format('create policy %I on public.%I for all to service_role using (true) with check (true)', policy_name, table_name);
    end if;
  end loop;
end $$;

-- Repair known function warnings without changing application behavior.
do $$
begin
  if to_regprocedure('public.set_current_timestamp_updated_at()') is not null then
    alter function public.set_current_timestamp_updated_at() set search_path = public;
  end if;
  if to_regprocedure('public.apply_updated_at_trigger()') is not null then
    alter function public.apply_updated_at_trigger() set search_path = public;
  end if;
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from anon;
    revoke execute on function public.rls_auto_enable() from authenticated;
    alter function public.rls_auto_enable() set search_path = public;
  end if;
end $$;

-- Keep bridge_credentials service-role only. No anon/authenticated policy is granted.
