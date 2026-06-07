-- AUTO BUILDER OS runtime telemetry compatibility hardening
-- Scope: additive/dev-branch first. Do not apply to production without explicit approval.
-- Purpose: allow the current app telemetry writer to insert event_name/source_system/status/payload
-- while preserving legacy telemetry_key/event_status/event_payload compatibility.

alter table public.runtime_telemetry_events
  add column if not exists event_name text,
  add column if not exists source_system text not null default 'auto_builder',
  add column if not exists status text not null default 'captured',
  add column if not exists payload jsonb not null default '{}'::jsonb;

alter table public.runtime_telemetry_events
  alter column telemetry_key set default 'unknown',
  alter column event_status set default 'captured',
  alter column event_payload set default '{}'::jsonb,
  alter column event_name set default 'unknown';

update public.runtime_telemetry_events
set
  event_name = coalesce(event_name, telemetry_key, 'unknown'),
  status = coalesce(status, event_status, 'captured'),
  payload = coalesce(payload, event_payload, '{}'::jsonb),
  source_system = coalesce(source_system, 'auto_builder')
where event_name is null
   or status is null
   or payload is null
   or source_system is null;

alter table public.runtime_telemetry_events
  alter column event_name set not null;

create or replace function public.sync_runtime_telemetry_events_compat()
returns trigger
language plpgsql
as $$
begin
  new.event_name := coalesce(new.event_name, new.telemetry_key, 'unknown');
  new.telemetry_key := coalesce(new.telemetry_key, new.event_name, 'unknown');

  new.status := coalesce(new.status, new.event_status, 'captured');
  new.event_status := coalesce(new.event_status, new.status, 'captured');

  new.payload := coalesce(new.payload, new.event_payload, '{}'::jsonb);
  new.event_payload := coalesce(new.event_payload, new.payload, '{}'::jsonb);

  new.source_system := coalesce(new.source_system, 'auto_builder');
  new.updated_at := coalesce(new.updated_at, now());
  return new;
end;
$$;

drop trigger if exists sync_runtime_telemetry_events_compat on public.runtime_telemetry_events;

create trigger sync_runtime_telemetry_events_compat
before insert or update on public.runtime_telemetry_events
for each row
execute function public.sync_runtime_telemetry_events_compat();

create index if not exists runtime_telemetry_events_event_name_created_at_idx
  on public.runtime_telemetry_events (event_name, created_at desc);

create index if not exists runtime_telemetry_events_source_system_created_at_idx
  on public.runtime_telemetry_events (source_system, created_at desc);

notify pgrst, 'reload schema';
