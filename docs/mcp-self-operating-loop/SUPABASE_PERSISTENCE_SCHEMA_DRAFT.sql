-- AUTO_BUILDER MCP Self-Operating Loop v1 persistence schema draft
-- Status: DRAFT ONLY. Do not apply to production without explicit approval, advisor review, and rollback plan.
-- Purpose: Persist registry, readiness, receipts, validation, approval, optimization, browser evidence, and auto-fix work.

create schema if not exists autobuilder_mcp;

create table if not exists autobuilder_mcp.mcp_registry (
  id text primary key,
  name text not null,
  category text not null,
  tier text not null,
  industry_fit text[] not null default array['universal'],
  priority_score integer not null default 0,
  business_value_score integer not null default 0,
  automation_score integer not null default 0,
  autonomy_score integer not null default 0,
  security_risk_score integer not null default 0,
  blast_radius text not null default 'medium',
  default_mode text not null default 'read_only',
  max_autonomy_allowed text not null default 'read',
  required_credentials jsonb not null default '[]'::jsonb,
  allowed_autonomous_actions text[] not null default '{}',
  requires_approval_actions text[] not null default '{}',
  forbidden_actions text[] not null default '{}',
  validation_tests text[] not null default '{}',
  rollback_required boolean not null default true,
  rollback_strategy text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists autobuilder_mcp.mcp_readiness (
  id uuid primary key default gen_random_uuid(),
  mcp_id text not null references autobuilder_mcp.mcp_registry(id) on delete cascade,
  readiness_state text not null,
  missing_credentials text[] not null default '{}',
  official_mcp_available boolean,
  api_available boolean,
  workflow_bridge_available boolean,
  browser_automation_possible boolean,
  next_safe_step text not null,
  blockers jsonb not null default '[]'::jsonb,
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists autobuilder_mcp.mcp_receipts (
  receipt_id text primary key,
  run_id text,
  mcp_id text,
  category text not null,
  action text not null,
  autonomy_level integer not null,
  risk_class text not null,
  approval_state text not null,
  target text not null,
  inputs_hash text not null,
  result_summary text not null,
  validation_status text not null,
  rollback_ref text,
  next_action text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists autobuilder_mcp.mcp_validation_results (
  id uuid primary key default gen_random_uuid(),
  run_id text,
  validator_id text not null,
  target text not null,
  passed boolean not null,
  severity text not null default 'info',
  evidence jsonb not null default '{}'::jsonb,
  next_action text,
  created_at timestamptz not null default now()
);

create table if not exists autobuilder_mcp.mcp_approval_queue (
  id uuid primary key default gen_random_uuid(),
  run_id text,
  mcp_id text,
  requested_action text not null,
  risk_class text not null,
  reason text not null,
  rollback_strategy text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists autobuilder_mcp.mcp_optimization_queue (
  id uuid primary key default gen_random_uuid(),
  run_id text,
  target text not null,
  hypothesis text not null,
  priority text not null default 'P2',
  validator text not null,
  status text not null default 'queued',
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists autobuilder_mcp.mcp_browser_validation_receipts (
  id uuid primary key default gen_random_uuid(),
  run_id text,
  target_url text not null,
  check_name text not null,
  status text not null,
  screenshot_ref text,
  console_errors jsonb not null default '[]'::jsonb,
  network_errors jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists autobuilder_mcp.mcp_auto_fix_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id text,
  failure_id text not null,
  target_path text,
  proposed_action text not null,
  branch_name text,
  pr_url text,
  status text not null default 'draft',
  validation_result_id uuid references autobuilder_mcp.mcp_validation_results(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Keep private schema locked down by default. Runtime access should use service-role server routes only.
revoke all on schema autobuilder_mcp from anon, authenticated;
revoke all on all tables in schema autobuilder_mcp from anon, authenticated;

-- Enable RLS as defense-in-depth even though schema is private.
alter table autobuilder_mcp.mcp_registry enable row level security;
alter table autobuilder_mcp.mcp_readiness enable row level security;
alter table autobuilder_mcp.mcp_receipts enable row level security;
alter table autobuilder_mcp.mcp_validation_results enable row level security;
alter table autobuilder_mcp.mcp_approval_queue enable row level security;
alter table autobuilder_mcp.mcp_optimization_queue enable row level security;
alter table autobuilder_mcp.mcp_browser_validation_receipts enable row level security;
alter table autobuilder_mcp.mcp_auto_fix_tasks enable row level security;

-- Production application requires explicit policies or service-role-only route access after advisor review.
