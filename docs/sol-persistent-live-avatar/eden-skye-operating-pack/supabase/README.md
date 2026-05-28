# Eden Skye Supabase Sandbox Schema

Status: sandbox handoff only  
Target: Supabase branch or isolated staging project  
Production mutation: not authorized

## Purpose

`EDEN_SKYE_SANDBOX_SCHEMA.sql` defines the proposed data layer for reviewing Eden Skye persona assets, prompt banks, content queues, approval events, and signal logs.

This file is intentionally stored inside the Eden Skye operating pack rather than `supabase/migrations/` so it cannot be accidentally applied by a production migration pipeline.

## Tables

- `eden_persona_assets` - image/video/doc/prompt asset registry and public URL readiness.
- `eden_prompt_bank` - Kling, HeyGen, Xyla, Shopify, Metricool, Repurpose, and OpenAI prompt/script records.
- `eden_content_queue` - draft/scheduled/published content queue with platform, pillar, asset references, and approval state.
- `eden_approval_events` - approval ledger for public posting, scheduling, Shopify, HeyGen, paid promotion, and other gated actions.
- `eden_signal_logs` - platform metrics and monetization signals tied back to queue items.

## RLS Posture

All tables enable RLS. Authenticated users receive read-only review access. Write operations should go through governed server-side routes that enforce approval gates.

## Sandbox Validation

Run only in a Supabase branch or isolated staging project:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name like 'eden_%'
order by table_name;
```

Expected tables:

- `eden_approval_events`
- `eden_content_queue`
- `eden_persona_assets`
- `eden_prompt_bank`
- `eden_signal_logs`

RLS check:

```sql
select relname, relrowsecurity
from pg_class
where relname like 'eden_%'
order by relname;
```

Expected: `relrowsecurity = true` for all Eden tables.

## Promotion Gate

Before moving this schema into an actual migration path:

1. Confirm sandbox project/branch ID.
2. Apply SQL in sandbox only.
3. Run RLS/advisor checks.
4. Verify seeded data appears in the FRONTEND review plan.
5. Capture rollback script.
6. Request explicit approval before production migration.
