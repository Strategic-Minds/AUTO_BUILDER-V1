# Supabase Schema Proposal

## VERIFIED
- Proposal only. No migration applied.

## INFERRED
- Buildoff needs run, source, agent, approval, validation, and artifact registries.

## COULD NOT VERIFY
- Existing production schema.

## BLOCKERS
- User forbids production Supabase writes.

## WORKAROUNDS
- Keep SQL as proposal only.

## NEXT ACTIONS
- Read-only schema inspection can be requested later.

```sql
-- PROPOSAL ONLY. DO NOT APPLY WITHOUT EXPLICIT APPROVAL.
create table if not exists openai_buildoff_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text unique not null,
  branch_name text not null,
  production_mutation boolean not null default false,
  publishing_enabled boolean not null default false,
  deployment_enabled boolean not null default false,
  shopify_mutation_enabled boolean not null default false,
  heygen_training_enabled boolean not null default false,
  approval_required boolean not null default true,
  status text not null default 'draft',
  verdict text,
  created_at timestamptz not null default now()
);

create table if not exists openai_buildoff_sources (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  source_type text not null,
  title text not null,
  url_or_path text,
  verification_status text not null default 'unverified',
  notes text
);

create table if not exists openai_buildoff_validation_cases (
  id uuid primary key default gen_random_uuid(),
  run_key text not null,
  case_key text not null,
  expected_result text not null,
  actual_result text,
  status text not null default 'not_run'
);
```
