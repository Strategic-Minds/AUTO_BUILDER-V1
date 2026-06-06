-- AWOS Bridge Event Bus
-- Applies only after explicit Supabase schema approval.
-- Creates a governed event log, connection registry, and credential reference table
-- for n8n, Codex, local systems, Eden, and AUTO_BUILDER event routing.

create extension if not exists pgcrypto;

create or replace function public.bridge_set_updated_at()
returns trigger
language plpgsql
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

create index if not exists bridge_events_phase_status_created_idx on public.bridge_events (phase, status, created_at desc);
create index if not exists bridge_events_source_target_created_idx on public.bridge_events (source_system, target_system, created_at desc);
create index if not exists bridge_events_retry_idx on public.bridge_events (status, next_retry_at, retry_count) where status in ('failed', 'retry');
create index if not exists bridge_connections_active_idx on public.bridge_connections (active, health_status);

create or replace trigger bridge_events_set_updated_at
before update on public.bridge_events
for each row execute function public.bridge_set_updated_at();

create or replace trigger bridge_connections_set_updated_at
before update on public.bridge_connections
for each row execute function public.bridge_set_updated_at();

create or replace trigger bridge_credentials_set_updated_at
before update on public.bridge_credentials
for each row execute function public.bridge_set_updated_at();

create or replace function public.bridge_touch_connection_from_event()
returns trigger
language plpgsql
as $$
begin
  update public.bridge_connections
  set last_ping = now(), health_status = case when active then health_status else 'degraded' end
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

-- Authenticated systems can read their own events when their JWT app_metadata includes bridge_system.
-- Writes remain backend-only through service-role routes that verify HMAC/bearer auth.
drop policy if exists "bridge systems can read own events" on public.bridge_events;
create policy "bridge systems can read own events"
on public.bridge_events
for select
to authenticated
using (
  coalesce(auth.jwt() -> 'app_metadata' ->> 'bridge_system', '') in (source_system, target_system)
);

drop policy if exists "authenticated systems can read active connection health" on public.bridge_connections;
create policy "authenticated systems can read active connection health"
on public.bridge_connections
for select
to authenticated
using (active = true);

-- No anon/authenticated policy is granted on bridge_credentials. Service role only.

-- Allow Supabase Realtime/Postgres Changes subscribers after approval. The publication normally exists in Supabase.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.bridge_events;
    exception when duplicate_object then
      null;
    end;
  end if;
end;
$$;
