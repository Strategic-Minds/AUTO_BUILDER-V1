-- Tighten AUTO BUILDER OS runtime telemetry compatibility sync.
-- Scope: dev-branch first. Do not apply to production without explicit approval.
-- Purpose: defaults are applied before BEFORE triggers, so treat legacy defaults as unset
-- when the current app-shaped columns contain stronger values.

create or replace function public.sync_runtime_telemetry_events_compat()
returns trigger
language plpgsql
as $$
begin
  new.event_name := coalesce(nullif(new.event_name, 'unknown'), nullif(new.telemetry_key, 'unknown'), 'unknown');
  new.telemetry_key := coalesce(nullif(new.telemetry_key, 'unknown'), new.event_name, 'unknown');

  new.status := coalesce(nullif(new.status, 'captured'), nullif(new.event_status, 'captured'), new.status, new.event_status, 'captured');
  new.event_status := coalesce(nullif(new.event_status, 'captured'), new.status, 'captured');

  if new.payload is null or new.payload = '{}'::jsonb then
    new.payload := coalesce(new.event_payload, '{}'::jsonb);
  end if;

  if new.event_payload is null or new.event_payload = '{}'::jsonb then
    new.event_payload := coalesce(new.payload, '{}'::jsonb);
  end if;

  new.source_system := coalesce(new.source_system, 'auto_builder');
  new.updated_at := coalesce(new.updated_at, now());
  return new;
end;
$$;

notify pgrst, 'reload schema';
