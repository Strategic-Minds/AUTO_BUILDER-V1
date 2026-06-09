# Wave 1 Supabase Receipt Persistence Fix

## Status

Draft only. Do not apply schema changes or production database mutations without explicit approval, Supabase advisor review, and rollback plan.

## Scope

Wave 1 remains limited to:

- GitHub route evidence.
- Vercel route/deployment evidence.
- Supabase receipt persistence compatibility.

Do not widen adapters beyond GitHub, Vercel, and Supabase receipt persistence in this lane.

## Verified Blocker

The deployed self-operating loop creates an MCP receipt successfully, but the Supabase REST insert into `runtime_telemetry_events` returns a schema-cache error:

- Table: `runtime_telemetry_events`
- Failing field: `blocker`
- Error class: `PGRST204`
- Impact: receipt remains available in route response, but durable telemetry insert fails.

## Root Cause

The receipt helper attempted to write `blocker` as a top-level column in `runtime_telemetry_events`. The active table schema does not expose that column through the Supabase Data API schema cache.

## Branch-Safe Code Fix

Move blocker detail into the existing JSON evidence payload instead of requiring a new production column.

Expected payload shape:

```json
{
  "worker": "auto-builder-mcp-universe",
  "status": "success",
  "event_type": "mcp_universe_receipt",
  "evidence": "{\"receipt\":{...},\"blocker\":null}",
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
3. Confirm `telemetry.telemetry.ok` is no longer blocked by missing `blocker` column.
4. Confirm no secret values appear in the response.
5. Confirm production actions remain disabled.
6. Only after explicit approval, test private `autobuilder_mcp.mcp_receipts` persistence on an isolated Supabase branch or approved target.

## Rollback

- Revert the branch commit that changes `src/lib/autobuilder-v2/mcp-universe/receipts.ts`.
- No database rollback is required for the branch-safe compatibility fix because it does not alter schema.
- Any future approved migration must include a matching down/rollback script before apply.
