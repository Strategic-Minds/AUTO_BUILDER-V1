-- AUTO_BUILDER V1 Autonomous Package Loop control-plane draft
-- Date: 2026-07-03
-- Governance: branch-safe migration draft only. Do not apply to production until reviewed,
-- dry-run validated, rollback-reviewed, and explicitly approved by the operator.

create table if not exists automation_queue (
  queue_id text primary key,
  project_id text not null default 'auto_builder_v1',
  queue_state text not null check (queue_state in (
    'on_deck', 'active', 'waiting_approval', 'validating', 'fixing', 'hardening',
    'ready_for_next_step', 'maintenance', 'blocked', 'complete', 'archived'
  )),
  lifecycle_stage text not null check (lifecycle_stage in (
    'intake', 'discovery', 'strategy', 'package_approval', 'mvp_build',
    'validation', 'revision', 'launch_prep', 'maintenance', 'optimization'
  )),
  priority integer not null default 100,
  risk_class integer not null default 1 check (risk_class between 1 and 5),
  protected_action boolean not null default false,
  title text not null,
  next_action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_runs (
  run_id text primary key,
  source text not null,
  cadence text not null,
  dry_run boolean not null default true,
  production_action_allowed boolean not null default false,
  final_score integer not null default 0,
  package_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists automation_jobs (
  job_id text primary key,
  run_id text references automation_runs(run_id) on delete set null,
  queue_id text references automation_queue(queue_id) on delete set null,
  worker_name text not null,
  job_state text not null default 'planned' check (job_state in (
    'planned', 'active', 'validating', 'fixing', 'hardening', 'waiting_approval',
    'blocked', 'complete', 'failed'
  )),
  dry_run boolean not null default true,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_scorecards (
  scorecard_id text primary key,
  run_id text references automation_runs(run_id) on delete cascade,
  final_score integer not null,
  threshold integer not null default 90,
  categories jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists automation_repair_queue (
  repair_id text primary key,
  run_id text references automation_runs(run_id) on delete set null,
  finding_id text,
  repair_type text not null,
  status text not null default 'recipe_ready' check (status in (
    'recipe_ready', 'branch_ready', 'validating', 'blocked', 'complete', 'archived'
  )),
  auto_fix_allowed boolean not null default true,
  protected_action boolean not null default false,
  recipe jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_hardening_queue (
  hardening_id text primary key,
  run_id text references automation_runs(run_id) on delete set null,
  category text not null,
  status text not null default 'on_deck' check (status in (
    'on_deck', 'active', 'validating', 'blocked', 'complete', 'archived'
  )),
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high', 'critical')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_package_candidates (
  package_id text primary key,
  run_id text references automation_runs(run_id) on delete set null,
  status text not null check (status in ('draft', 'ready_for_review', 'blocked')),
  final_score integer not null default 0,
  manifest jsonb not null default '{}'::jsonb,
  approval_required_for text[] not null default array[]::text[],
  created_at timestamptz not null default now()
);

create table if not exists automation_approvals (
  approval_id text primary key,
  run_id text references automation_runs(run_id) on delete set null,
  action text not null,
  status text not null default 'required' check (status in ('required', 'approved', 'rejected', 'expired')),
  reason text not null,
  approved_by text,
  approved_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists automation_receipts (
  receipt_id text primary key,
  run_id text references automation_runs(run_id) on delete set null,
  action text not null,
  status text not null,
  dry_run boolean not null default true,
  production_mutated boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table automation_queue enable row level security;
alter table automation_runs enable row level security;
alter table automation_jobs enable row level security;
alter table automation_scorecards enable row level security;
alter table automation_repair_queue enable row level security;
alter table automation_hardening_queue enable row level security;
alter table automation_package_candidates enable row level security;
alter table automation_approvals enable row level security;
alter table automation_receipts enable row level security;

drop policy if exists automation_queue_service_role_all on automation_queue;
create policy automation_queue_service_role_all on automation_queue
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists automation_runs_service_role_all on automation_runs;
create policy automation_runs_service_role_all on automation_runs
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists automation_jobs_service_role_all on automation_jobs;
create policy automation_jobs_service_role_all on automation_jobs
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists automation_scorecards_service_role_all on automation_scorecards;
create policy automation_scorecards_service_role_all on automation_scorecards
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists automation_repair_queue_service_role_all on automation_repair_queue;
create policy automation_repair_queue_service_role_all on automation_repair_queue
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists automation_hardening_queue_service_role_all on automation_hardening_queue;
create policy automation_hardening_queue_service_role_all on automation_hardening_queue
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists automation_package_candidates_service_role_all on automation_package_candidates;
create policy automation_package_candidates_service_role_all on automation_package_candidates
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists automation_approvals_service_role_all on automation_approvals;
create policy automation_approvals_service_role_all on automation_approvals
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists automation_receipts_service_role_all on automation_receipts;
create policy automation_receipts_service_role_all on automation_receipts
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

comment on table automation_queue is 'AUTO_BUILDER autonomous package loop queue. Service-role only until explicit policies are approved.';
comment on table automation_runs is 'AUTO_BUILDER autonomous package loop run receipts and payloads.';
comment on table automation_package_candidates is 'Branch/draft release candidates generated by the autonomous package loop.';
