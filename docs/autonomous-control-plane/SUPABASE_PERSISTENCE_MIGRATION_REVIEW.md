# Supabase Persistence Migration Review

## Status

Review-only. No migration was applied in this branch.

Project inspected: `prhppuuwcnmfdhwsagug`.

## Verified Read-Only Checks

- Security advisors returned no lints at inspection time.
- Performance advisors returned existing backlog items, including unindexed foreign keys, unused indexes, multiple permissive policy warnings, and Auth DB connection strategy guidance.
- Existing migrations list is populated through `20260606083227_autobuilder_production_advisor_cleanup_approved`.

## Purpose

Persist autonomous control-plane receipts and approval-gated task state after separate operator approval.

This migration is intentionally narrow and additive. It does not alter existing tables.

## Draft Migration SQL

```sql
create table if not exists public.autonomous_control_plane_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  mode text not null check (mode in ('preview_sandbox_autonomous', 'production_gated_autonomous')),
  production_action_allowed boolean not null default false,
  readiness_score integer not null default 0 check (readiness_score between 0 and 100),
  receipt jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.autonomous_control_plane_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.autonomous_control_plane_runs(id) on delete cascade,
  task_key text not null,
  lane text not null,
  title text not null,
  status text not null check (status in ('ready', 'done', 'blocked')),
  risk_class integer not null check (risk_class between 1 and 5),
  mutation boolean not null default false,
  approval_required boolean not null default true,
  next_action text not null,
  created_at timestamptz not null default now(),
  unique (run_id, task_key)
);

create index if not exists autonomous_control_plane_runs_created_at_idx
  on public.autonomous_control_plane_runs(created_at desc);

create index if not exists autonomous_control_plane_tasks_run_id_idx
  on public.autonomous_control_plane_tasks(run_id);

create index if not exists autonomous_control_plane_tasks_status_idx
  on public.autonomous_control_plane_tasks(status);

alter table public.autonomous_control_plane_runs enable row level security;
alter table public.autonomous_control_plane_tasks enable row level security;

create policy "service_role manages autonomous_control_plane_runs"
  on public.autonomous_control_plane_runs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service_role manages autonomous_control_plane_tasks"
  on public.autonomous_control_plane_tasks
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
```

## Rollback SQL

```sql
drop table if exists public.autonomous_control_plane_tasks;
drop table if exists public.autonomous_control_plane_runs;
```

## Review Notes

- RLS is enabled on both public tables.
- Policies are service-role only to avoid exposing operational receipts through anon/authenticated Data API clients.
- Foreign-key indexes are included for the task/run relationship.
- The migration does not grant anon or authenticated table access.
- Production apply must be followed by security and performance advisors.

## Approval Gate

Do not apply this migration until:

1. Preview route validation passes.
2. Browser QA evidence is captured.
3. Signed cron positive-path evidence is captured without exposing secrets.
4. Rollback SQL is accepted.
5. Operator explicitly approves live Supabase migration apply.
