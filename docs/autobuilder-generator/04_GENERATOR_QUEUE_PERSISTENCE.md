# Generator Queue Persistence Contract

## Purpose

Define how AUTO BUILDER Generator Factory queue persistence widens from dry-run/read status into Supabase-backed queue and receipt writes.

## Current State

- Generator status route is public/read-only at `/api/generator/status`.
- Generator execution route is cron-protected at `/api/cron/autobuilder-generator`.
- Generator route can write a telemetry receipt only when Supabase service-role env is configured.
- Persistent command writes remain gated by `AUTO_BUILDER_ADMIN_WRITE_ENABLED=true` and approval policy.

## Required Tables

Minimum existing or planned tables:

- `runtime_telemetry_events`
- `queue_jobs`
- `bridge_tasks`
- `bridge_receipts`
- `approval_gate_escalation_queue`
- `browser_evidence`
- `browser_screenshots`

## Required Env Names

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BRIDGE_TABLE_ALLOWLIST`
- `AUTO_BUILDER_ADMIN_WRITE_ENABLED`
- `AUTO_BUILDER_BRIDGE_TOKEN`
- `CRON_SECRET`

## Widening Sequence

1. Verify `/api/generator/status` returns read-only state.
2. Verify `/api/cron/autobuilder-generator` blocks without cron auth.
3. Run authorized generator smoke with `CRON_SECRET`.
4. Confirm `runtime_telemetry_events` can accept read/dry-run generator receipts.
5. Add `queue_jobs` to `SUPABASE_BRIDGE_TABLE_ALLOWLIST`.
6. Keep `AUTO_BUILDER_ADMIN_WRITE_ENABLED=false` until queue schema is confirmed.
7. Enable preview-only `AUTO_BUILDER_ADMIN_WRITE_ENABLED=true` after approval.
8. Queue harmless generator task.
9. Confirm receipt and rollback reference.
10. Only then widen to build packet queue and frontend approval panels.

## Write Gate

A generator write is allowed only when all are true:

- Supabase env is configured.
- Target table is allowlisted.
- `AUTO_BUILDER_ADMIN_WRITE_ENABLED=true`.
- Risk policy allows the action.
- Risk class 2+ includes `approvalId`.
- The operation emits a receipt.

## Blocked By Default

- Schema migration.
- Production data mutation.
- Production deploy.
- Secret change.
- Google Chat send.
- Shopify or Stripe mutation.
- Credentialed browser action.

## Next Implementation Step

Add frontend generator panels that read `/api/generator/status`, then run authorized smoke before enabling any persistent queue write.
