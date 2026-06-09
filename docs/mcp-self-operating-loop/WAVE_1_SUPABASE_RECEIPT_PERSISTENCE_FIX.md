# Wave 1 Supabase Receipt Persistence Fix

## Status

Draft plus branch-safe compatibility patch. Do not apply schema changes or production database mutations without explicit approval, Supabase advisor review, and rollback plan.

Latest preview evidence shows the branch-safe compatibility patch writes receipt telemetry successfully to the existing public telemetry table. MCP-specific persistence tables remain draft-only.

## Scope

Wave 1 remains limited to:

- GitHub route evidence.
- Vercel route/deployment evidence.
- Supabase receipt persistence compatibility.

Do not widen adapters beyond GitHub, Vercel, and Supabase receipt persistence in this lane.

## Verified Blockers Resolved

The deployed self-operating loop creates an MCP receipt successfully. Earlier Supabase REST inserts into `runtime_telemetry_events` returned schema-cache errors because the receipt helper attempted to write fields that did not exist as top-level columns.

Earlier failing fields:

- `blocker`
- `event_type`

Earlier error class:

- `PGRST204`

Current preview result:

- `/api/mcp-universe/self-operating-loop` returned HTTP 200.
- Supabase REST insert into `runtime_telemetry_events` returned HTTP 201.
- Verified inserted telemetry row id: `75e84e49-2731-488b-b3fb-ee4e36c17e88`.
- Production actions remained disabled.

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

Read-only inspection also confirmed no `autobuilder_mcp` tables are currently present in the live database. That is expected because the MCP-specific schema draft has not been approved or applied.

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

## Advisor Review

Latest read-only advisor review against project `prhppuuwcnmfdhwsagug`:

- Security advisors: no lints returned.
- Performance advisors: existing INFO/WARN backlog remains.

Existing performance advisor themes:

- Unindexed foreign keys across existing public tables.
- Unused indexes across existing public tables.
- Multiple permissive policies on selected existing public tables.
- Auth DB connection strategy uses an absolute connection count.

These advisor findings are existing database-health backlog items, not evidence that the MCP-specific schema draft has been applied.

## Static Draft Review

The draft uses a private schema:

```sql
create schema if not exists autobuilder_mcp;
```

It also revokes access from `anon` and `authenticated`, and enables RLS on all draft tables as defense in depth.

Static review notes before any apply:

- Keep `autobuilder_mcp` private unless an explicit Data API exposure decision is approved.
- If any draft table is later exposed to the Data API, add explicit grants plus RLS policies before allowing client access.
- Add indexes for any future high-volume lookup fields before production use, especially `run_id`, `mcp_id`, `created_at`, `status`, and queue state fields.
- Keep service-role writes server-side only; never expose service-role credentials to clients.
- Produce a rollback/down migration before applying the schema.

Supabase changelog relevance:

- Supabase has a database breaking-change note that tables are not automatically exposed to Data and GraphQL APIs. This supports the current private-schema posture and means future exposure must be deliberate, not assumed.

## Validation Plan

1. Deploy branch-safe code fix to preview.
2. Re-run `/api/mcp-universe/self-operating-loop`.
3. Confirm `telemetry.telemetry.ok` is no longer blocked by `PGRST204` schema-cache errors.
4. Confirm no secret values appear in the response.
5. Confirm production actions remain disabled.
6. Only after explicit approval, test private `autobuilder_mcp.mcp_receipts` persistence on an isolated Supabase branch or approved target.
7. Re-run Supabase security and performance advisors after any approved migration.

## Rollback

- Revert the branch commit that changes `src/lib/autobuilder-v2/mcp-universe/receipts.ts`.
- No database rollback is required for the branch-safe compatibility fix because it does not alter schema.
- Any future approved migration must include a matching down/rollback script before apply.
