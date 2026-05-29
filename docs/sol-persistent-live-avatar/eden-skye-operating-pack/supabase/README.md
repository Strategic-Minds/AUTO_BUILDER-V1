# Forbidden Fruit Supabase Sandbox Schema

Status: sandbox handoff only  
Target: Supabase branch or isolated staging project  
Production mutation: not authorized

## Purpose

`EDEN_SKYE_SANDBOX_SCHEMA.sql` now defines the reusable Forbidden Fruit data layer. Eden Skye is seeded as Persona 001, but the table names are no longer Eden-only.

This file is intentionally stored inside the Eden Skye operating pack rather than `supabase/migrations/` so it cannot be accidentally applied by a production migration pipeline.

## Tables

- `forbidden_fruit_personas` - parent persona registry, fictional AI disclosure, archetype, boundaries, and launch status.
- `persona_assets` - image/video/audio/doc/prompt asset registry and public URL readiness.
- `persona_prompt_bank` - Kling, HeyGen, Xyla, Shopify, Metricool, Repurpose, OpenAI, chat, voice, and video prompt/script records.
- `content_products` - draft content queue and commerce/download product rows with platform, pillar, asset references, content rating, and approval state.
- `interaction_modes` - chat, voice, video, download, social, and storefront modes with safety requirements.
- `approval_events` - approval ledger for public posting, scheduling, Shopify, HeyGen, paid promotion, interaction launch, and other gated actions.
- `signal_logs` - platform metrics and monetization signals tied back to content products or interaction modes.

## RLS Posture

All Forbidden Fruit tables enable RLS. Authenticated users receive read-only review access. Write operations should go through governed server-side routes that enforce approval gates.

## Sandbox Validation

Run only in a Supabase branch or isolated staging project:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'forbidden_fruit_personas',
    'persona_assets',
    'persona_prompt_bank',
    'content_products',
    'interaction_modes',
    'approval_events',
    'signal_logs'
  )
order by table_name;
```

Expected tables:

- `approval_events`
- `content_products`
- `forbidden_fruit_personas`
- `interaction_modes`
- `persona_assets`
- `persona_prompt_bank`
- `signal_logs`

RLS check:

```sql
select relname, relrowsecurity
from pg_class
where relname in (
  'forbidden_fruit_personas',
  'persona_assets',
  'persona_prompt_bank',
  'content_products',
  'interaction_modes',
  'approval_events',
  'signal_logs'
)
order by relname;
```

Expected: `relrowsecurity = true` for all Forbidden Fruit tables.

## Promotion Gate

Before moving this schema into an actual migration path:

1. Confirm sandbox project/branch ID.
2. Apply SQL in sandbox only.
3. Run RLS/advisor checks.
4. Verify seeded Forbidden Fruit / Eden Skye rows appear in the review UI.
5. Verify platform-policy blockers display before live commerce or distribution.
6. Capture rollback script.
7. Request explicit approval before production migration.
