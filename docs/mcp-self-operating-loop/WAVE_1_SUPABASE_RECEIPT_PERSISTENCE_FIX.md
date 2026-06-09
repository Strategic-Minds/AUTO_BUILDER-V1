# Wave 1 Supabase Receipt Persistence Fix

## Status

Draft plus branch-safe compatibility patch. Do not apply schema changes or production database mutations without explicit approval, Supabase advisor review, and rollback plan.

## Scope

Wave 1 remains limited to:

- GitHub route evidence.
- Vercel route/deployment evidence.
- Supabase receipt persistence compatibility.

Do not widen adapters beyond GitHub, Vercel, and Supabase receipt persistence in this lane.

## Verified Blockers

The deployed self-operating loop creates an MCP receipt successfully, but earlier Supabase REST inserts into `runtime_telemetry_events` returned schema-cache errors.

Observed failing fields:

- `blocker`
- `event_type`

Error class:

- `PGRST204`

Impact:

- Receipt remained available in route response.
- Durable telemetry insert failed until the payload was aligned to the actual table columns.

## Verified Table Shape

Read-only information-schema inspection verified `public.runtime_telemetry_events` exposes these columns:

| Column | Type | Nullable |
| --- | --- | --- |
| `id` | `uuid` | no |
| `telemetry_key` | `text` | no |
| `event_status` | `text` | no |
| `event_payload` | `jsonb` | no |
| `created_at` | `timestamptz` | no |
| `updated_at` | `timestamptz` | no |

## Root Cause

The receipt helper attempted to write top-level fields that are not present in `runtime_telemetry_events`. The active table is shaped for a key, status, and JSON payload, not arbitrary top-level receipt columns.

## Branch-Safe Code Fix

Write receipt details into `event_payload` and use only verified top-level columns.

Expected payload shape:

```json
{
  "telemetry_key": "mcp-20260609000000000-auto-builder-mcp-pulse",
  "event_status": "success",
  "event_payload": {
    "eventType": "mcp_universe_receipt",
    "worker": "auto-builder-mcp-universe",
    "receipt": {},
    "blocker": null
  },
  "created_at": "2026-06-09T00:00:00.000Z"
}
```

This preserves the blocker signal while avoiding production schema mutation.

## Optional Future Migration

After approval, durable MCP-specific receipt tables can be added under the private `autobuilder_mcp` schema from `SUPABASE_PERSISTENCE_SCHEMA_DRAFT.sql`.

Recommended first write target after approval:

```sql
insert into autobuilder_mcp.mcp_receipts (
  receipt_id,
  mcp_id,
  category,
  action,
  autonomy_level,
  risk_class,
  approval_state,
  target,
  inputs_hash,
  result_summary,
  validation_status,
  rollback_ref,
  next_action,
  evidence
) values (...);
```

## Advisor Review Required Before Apply

Run Supabase advisors before and after any approved migration:

- security advisors
- performance advisors

Current read-only advisor state from preview validation:

- Security: no lints.
- Performance: existing INFO/WARN backlog, including unindexed foreign keys, unused indexes, and multiple permissive policy warnings.

## Validation Plan

1. Deploy branch-safe code fix to preview.
2. Re-run `/api/mcp-universe/self-operating-loop`.
3. Confirm `telemetry.telemetry.ok` is no longer blocked by `PGRST204` schema-cache errors.
4. Confirm no secret values appear in the response.
5. Confirm production actions remain disabled.
6. Only after explicit approval, test private `autobuilder_mcp.mcp_receipts` persistence on an isolated Supabase branch or approved target.

## Rollback

- Revert the branch commit that changes `src/lib/autobuilder-v2/mcp-universe/receipts.ts`.
- No database rollback is required for the branch-safe compatibility fix because it does not alter schema.
- Any future approved migration must include a matching down/rollback script before apply.
