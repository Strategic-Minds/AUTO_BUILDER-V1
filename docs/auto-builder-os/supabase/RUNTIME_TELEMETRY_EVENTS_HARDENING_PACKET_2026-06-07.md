# Runtime Telemetry Events Hardening Packet

Date: 2026-06-07
PR: #19
Project: Strategic Minds Advisory Supabase
Production project ref: `prhppuuwcnmfdhwsagug`
Dev branch used for validation: `eden-governed-runtime-test`
Dev branch project ref: `jhzrkllkevahrotyyitr`

## Phase

Supabase hardening / preview-first validation.

## Problem

The verified generator tick route returned HTTP 200 and generated a plan, but telemetry persistence returned:

```json
{
  "status": 400,
  "message": "Could not find the 'event_name' column of 'runtime_telemetry_events' in the schema cache"
}
```

Repo source shows the app writes telemetry to `runtime_telemetry_events` with these fields:

- `event_name`
- `source_system`
- `status`
- `payload`
- `created_at`

Current Supabase table shape on production and dev branch is legacy-shaped:

- `id`
- `telemetry_key`
- `event_status`
- `event_payload`
- `created_at`
- `updated_at`

Because `telemetry_key` is `not null` without a default, adding only `event_name` is not enough. New app inserts would still fail unless the legacy columns also get safe defaults or compatibility sync.

## Migration

Migration file:

```text
supabase/migrations/20260607072000_harden_runtime_telemetry_events.sql
```

The migration is additive and compatibility-preserving:

- Adds `event_name`, `source_system`, `status`, and `payload` if missing.
- Adds safe defaults to legacy and new columns.
- Backfills new columns from legacy columns.
- Adds a `before insert or update` compatibility trigger to keep legacy and new names aligned.
- Adds lookup indexes for `event_name` and `source_system` by `created_at`.
- Sends `notify pgrst, 'reload schema'` to refresh PostgREST schema cache.

## Governance

This packet is dev-branch first. Do not merge/apply to production until:

1. Dev branch migration applies cleanly.
2. A harmless telemetry insert using the new app shape succeeds.
3. The inserted row mirrors into legacy columns.
4. Security/performance advisors are reviewed.
5. Operator approves production DB migration.

## Validation SQL

Use the dev branch first:

```sql
begin;

insert into public.runtime_telemetry_events (
  event_name,
  source_system,
  status,
  payload,
  created_at
)
values (
  'autobuilder.generator.tick.validation',
  'auto_builder',
  'success',
  '{"receipt":"dev-branch-validation","mutation":"rolled_back"}'::jsonb,
  now()
)
returning
  id,
  event_name,
  telemetry_key,
  source_system,
  status,
  event_status,
  payload,
  event_payload,
  created_at;

rollback;
```

Expected result:

- Insert succeeds.
- `event_name` equals `telemetry_key`.
- `status` equals `event_status`.
- `payload` equals `event_payload`.
- Transaction rolls back, leaving no durable dev data from this validation.

## Rollback

If the dev migration causes issues before production approval:

```sql
drop trigger if exists sync_runtime_telemetry_events_compat on public.runtime_telemetry_events;
drop function if exists public.sync_runtime_telemetry_events_compat();
drop index if exists public.runtime_telemetry_events_event_name_created_at_idx;
drop index if exists public.runtime_telemetry_events_source_system_created_at_idx;
alter table public.runtime_telemetry_events
  drop column if exists event_name,
  drop column if exists source_system,
  drop column if exists status,
  drop column if exists payload;
alter table public.runtime_telemetry_events
  alter column telemetry_key drop default;
notify pgrst, 'reload schema';
```

Only run rollback on the dev branch unless production rollback is explicitly approved.

## Next Action

Apply the migration to the dev branch, validate the harmless insert, then record the receipt in PR #19.
