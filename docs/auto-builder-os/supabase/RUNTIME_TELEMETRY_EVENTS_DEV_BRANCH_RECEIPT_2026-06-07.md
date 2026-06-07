# Runtime Telemetry Events Dev Branch Receipt

Date: 2026-06-07
PR: #19
Production project ref: `prhppuuwcnmfdhwsagug`
Dev branch: `eden-governed-runtime-test`
Dev branch project ref: `jhzrkllkevahrotyyitr`

## Result

Status: `dev_branch_verified`

The runtime telemetry compatibility repair was applied and validated on the Supabase dev branch only.

## Production Baseline Verified

`public.runtime_telemetry_events` production shape before production migration:

- `id uuid not null default gen_random_uuid()`
- `telemetry_key text not null`
- `event_status text not null default 'captured'`
- `event_payload jsonb not null default '{}'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

The app generator route writes:

- `event_name`
- `source_system`
- `status`
- `payload`
- `created_at`

## Dev Branch Migrations Applied

Applied on dev branch project ref `jhzrkllkevahrotyyitr`:

1. `harden_runtime_telemetry_events`
2. `tighten_runtime_telemetry_sync`
3. `set_runtime_telemetry_sync_search_path`

Repo migration files:

- `supabase/migrations/20260607072000_harden_runtime_telemetry_events.sql`
- `supabase/migrations/20260607074000_tighten_runtime_telemetry_sync.sql`
- `supabase/migrations/20260607074500_set_runtime_telemetry_sync_search_path.sql`

## Final Dev Branch Schema Verified

`public.runtime_telemetry_events` now includes:

- legacy compatibility columns: `telemetry_key`, `event_status`, `event_payload`
- current app columns: `event_name`, `source_system`, `status`, `payload`
- fixed-search-path trigger function: `public.sync_runtime_telemetry_events_compat()`
- compatibility trigger: `sync_runtime_telemetry_events_compat`

## Final Harmless Validation Write

Validation used a transaction and rolled back:

```sql
begin;
insert into public.runtime_telemetry_events (event_name, source_system, status, payload, created_at)
values (
  'autobuilder.generator.tick.validation.final',
  'auto_builder',
  'success',
  '{"receipt":"dev-branch-validation-final","mutation":"rolled_back"}'::jsonb,
  now()
)
returning id, event_name, telemetry_key, source_system, status, event_status, payload, event_payload, created_at;
rollback;
```

Returned proof:

```json
{
  "event_name": "autobuilder.generator.tick.validation.final",
  "telemetry_key": "autobuilder.generator.tick.validation.final",
  "source_system": "auto_builder",
  "status": "success",
  "event_status": "success",
  "payload": { "receipt": "dev-branch-validation-final", "mutation": "rolled_back" },
  "event_payload": { "receipt": "dev-branch-validation-final", "mutation": "rolled_back" }
}
```

## Advisor Evidence

Final security advisor result on dev branch:

```json
{ "lints": [] }
```

Performance advisor returned broad existing project warnings, mostly unrelated unindexed foreign keys and unused indexes. The new telemetry indexes are flagged as unused because this is a fresh dev-branch validation and no production-like query volume has used them yet.

## Governance

Production DB migration is still gated.

Do not apply these migrations to production until the operator explicitly approves production database mutation.

## Next Action

After production approval, apply the same three migration files to production, rerun the generator tick receipt, and confirm telemetry status is no longer `400`.
