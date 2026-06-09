create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.workbook_sync_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  drive_file_id text not null unique,
  title text not null,
  role text not null,
  status text not null default 'active',
  owner_email text,
  last_seen_modified_at timestamptz,
  last_inbound_sync_at timestamptz,
  last_outbound_sync_at timestamptz,
  sync_mode text not null default 'bidirectional',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workbook_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  drive_file_id text not null,
  run_type text not null check (run_type in ('inbound', 'outbound')),
  requested_sheets jsonb not null default '[]'::jsonb,
  force_run boolean not null default false,
  run_status text not null default 'running',
  actor text,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.workbook_sync_sheet_map (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_name text not null,
  purpose text not null,
  target_tables jsonb not null default '[]'::jsonb,
  direction text not null check (direction in ('inbound', 'outbound', 'both')),
  runtime_object_type text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_name)
);

create table if not exists public.workbook_rows_normalized (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  drive_file_id text not null,
  sheet_name text not null,
  sheet_row_key text not null,
  sheet_row_hash text not null,
  runtime_object_type text not null,
  runtime_object_id text,
  row_index integer not null,
  payload jsonb not null default '{}'::jsonb,
  last_runtime_status text,
  last_runtime_error text,
  last_synced_at timestamptz not null default now(),
  latest_inbound_run_id uuid references public.workbook_sync_runs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_name, sheet_row_key)
);

create table if not exists public.workbook_writeback_receipts (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  drive_file_id text not null,
  sheet_name text not null,
  row_count integer not null default 0,
  written_count integer not null default 0,
  actor text,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.prompt_registry (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  prompt_slug text not null,
  prompt_title text,
  prompt_body text not null,
  prompt_role text,
  prompt_tags jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  version_label text,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.workflow_stage_templates (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  workflow_slug text not null,
  stage_name text not null,
  stage_order integer,
  stage_rules jsonb not null default '{}'::jsonb,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.governance_rules (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  rule_slug text not null,
  rule_type text not null,
  enforcement_level text not null default 'hard',
  condition_payload jsonb not null default '{}'::jsonb,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.task_tag_map (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  task_tag text not null,
  github_label text,
  queue_tag text,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.simulation_fixtures (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  fixture_slug text not null,
  fixture_type text not null,
  input_payload jsonb not null default '{}'::jsonb,
  expected_payload jsonb not null default '{}'::jsonb,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.validation_rules (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  rule_slug text not null,
  validator_type text not null,
  severity text not null default 'medium',
  condition_payload jsonb not null default '{}'::jsonb,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.provider_capability_rules (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  provider_name text not null,
  capability_name text not null,
  consent_required boolean not null default false,
  policy_payload jsonb not null default '{}'::jsonb,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.playwright_test_profiles (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  profile_slug text not null,
  target_url text,
  assertions jsonb not null default '[]'::jsonb,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.channel_strategy_profiles (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  channel_name text not null,
  cadence_payload jsonb not null default '{}'::jsonb,
  content_mix_payload jsonb not null default '{}'::jsonb,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.media_job_templates (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  sheet_row_key text not null,
  template_slug text not null,
  template_type text not null,
  generation_payload jsonb not null default '{}'::jsonb,
  workbook_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.content_scorecards (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  sheet_row_key text,
  scorecard_key text not null,
  score_payload jsonb not null default '{}'::jsonb,
  period_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_key, sheet_row_key)
);

create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  sheet_row_key text,
  snapshot_type text not null,
  snapshot_payload jsonb not null default '{}'::jsonb,
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.optimization_backlog (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  sheet_row_key text,
  backlog_status text not null default 'open',
  priority integer not null default 100,
  recommendation text not null,
  evidence_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recursive_validation_runs (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  sheet_row_key text,
  run_status text not null default 'queued',
  score numeric(10,2),
  findings jsonb not null default '[]'::jsonb,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blocker_log (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  sheet_row_key text,
  runtime_object_type text,
  runtime_object_id text,
  blocker_type text not null,
  blocker_status text not null default 'open',
  severity text not null default 'medium',
  blocker_message text not null,
  remediation_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  sheet_row_key text,
  runtime_object_type text not null,
  runtime_object_id text,
  approval_type text not null,
  approval_status text not null default 'pending',
  requested_by text,
  approved_by text,
  request_payload jsonb not null default '{}'::jsonb,
  resolution_payload jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.release_gate_runs (
  id uuid primary key default gen_random_uuid(),
  source_key text,
  sheet_row_key text,
  runtime_object_type text not null,
  runtime_object_id text,
  gate_name text not null,
  gate_status text not null default 'blocked',
  evaluation_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connector_receipts (
  id uuid primary key default gen_random_uuid(),
  connector_name text not null,
  runtime_action text not null,
  receipt_status text not null,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  receipt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.autobuilder_bridge_state (
  id text primary key,
  scope text,
  key text,
  status text,
  payload jsonb,
  state jsonb,
  metadata jsonb,
  last_read_at timestamptz,
  last_write_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bridge_connector_actions (
  id uuid primary key default gen_random_uuid(),
  project_ref text,
  connector text not null,
  operation text not null,
  action_status text not null default 'pending',
  target_ref text,
  request_payload jsonb not null default '{}'::jsonb,
  result_payload jsonb,
  error_message text,
  requested_by text,
  approved boolean not null default false,
  safe boolean not null default false,
  claimed_by text,
  claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.runtime_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  telemetry_key text not null,
  event_status text not null default 'captured',
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'workbook_sync_sources','workbook_sync_sheet_map','workbook_rows_normalized','prompt_registry',
    'workflow_stage_templates','governance_rules','task_tag_map','simulation_fixtures','validation_rules',
    'provider_capability_rules','playwright_test_profiles','channel_strategy_profiles','media_job_templates',
    'content_scorecards','optimization_backlog','recursive_validation_runs','blocker_log','approval_requests',
    'release_gate_runs','autobuilder_bridge_state','bridge_connector_actions','runtime_telemetry_events'
  ] loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_current_timestamp_updated_at()', table_name || '_updated_at', table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'workbook_sync_sources','workbook_sync_runs','workbook_sync_sheet_map','workbook_rows_normalized',
    'workbook_writeback_receipts','prompt_registry','workflow_stage_templates','governance_rules','task_tag_map',
    'simulation_fixtures','validation_rules','provider_capability_rules','playwright_test_profiles',
    'channel_strategy_profiles','media_job_templates','content_scorecards','analytics_snapshots','optimization_backlog',
    'recursive_validation_runs','blocker_log','approval_requests','release_gate_runs','connector_receipts',
    'autobuilder_bridge_state','bridge_connector_actions','runtime_telemetry_events'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_service_role_all', table_name);
    execute format('create policy %I on public.%I for all to service_role using (true) with check (true)', table_name || '_service_role_all', table_name);
  end loop;
end $$;

insert into public.workbook_sync_sources (source_key, drive_file_id, title, role, status, sync_mode)
values
  ('content_media_integrated', '1lSev0Af8YlONzbXa_-l9FMsnNv_94rgE', 'SWF_Universal_AutoBuild_Workbook_OS_Content_Media_Integrated.xlsx', 'content_media', 'active', 'bidirectional'),
  ('benchmark_integrated', '1aF2ndVTNLFL8WbEuYWV6K-2GxmTU1wFc', 'SWF_Universal_AutoBuild_Workbook_OS_Benchmark_Integrated.xlsx', 'benchmark', 'active', 'bidirectional')
on conflict (source_key) do update
set drive_file_id = excluded.drive_file_id,
    title = excluded.title,
    role = excluded.role,
    status = excluded.status,
    sync_mode = excluded.sync_mode,
    updated_at = now();

insert into public.workbook_sync_sheet_map (source_key, sheet_name, purpose, target_tables, direction, runtime_object_type)
values
  ('content_media_integrated', '49_Avatar_Voice', 'provider, consent, and safety policy', '["provider_capability_rules"]'::jsonb, 'inbound', 'provider_capability_rule'),
  ('content_media_integrated', '50_Playwright_Agent', 'sandbox/browser test profiles', '["playwright_test_profiles"]'::jsonb, 'inbound', 'playwright_test_profile'),
  ('content_media_integrated', '51_Content_Workflow', 'stage machine and workflow templates', '["workflow_stage_templates"]'::jsonb, 'inbound', 'workflow_stage_template'),
  ('content_media_integrated', '52_Content_Governance', 'publish and compliance rules', '["governance_rules"]'::jsonb, 'inbound', 'governance_rule'),
  ('content_media_integrated', '53_Content_Task_Tags', 'task and GitHub label taxonomy', '["task_tag_map"]'::jsonb, 'inbound', 'task_tag_rule'),
  ('content_media_integrated', '54_Content_Prompts', 'prompt registry', '["prompt_registry"]'::jsonb, 'inbound', 'prompt_definition'),
  ('content_media_integrated', '55_Content_Simulations', 'replay scenarios', '["simulation_fixtures"]'::jsonb, 'inbound', 'simulation_fixture'),
  ('content_media_integrated', '56_Content_Validation', 'validation and readiness rules', '["validation_rules"]'::jsonb, 'inbound', 'validation_rule'),
  ('benchmark_integrated', '46_Recursive_Validation', 'recursive validation pass results', '["recursive_validation_runs"]'::jsonb, 'both', 'recursive_validation_run'),
  ('benchmark_integrated', '47_Social_Media_OS', 'operating mix and cadence', '["channel_strategy_profiles"]'::jsonb, 'inbound', 'channel_strategy_profile'),
  ('benchmark_integrated', '48_AI_Media_Generation', 'media generation templates', '["media_job_templates"]'::jsonb, 'inbound', 'media_job_template'),
  ('benchmark_integrated', '49_Avatar_Voice', 'duplicate provider policy source', '["provider_capability_rules"]'::jsonb, 'inbound', 'provider_capability_rule'),
  ('benchmark_integrated', '50_Playwright_Agent', 'duplicate sandbox source', '["playwright_test_profiles"]'::jsonb, 'inbound', 'playwright_test_profile'),
  ('benchmark_integrated', '51_Content_Workflow', 'duplicate workflow source', '["workflow_stage_templates"]'::jsonb, 'inbound', 'workflow_stage_template'),
  ('benchmark_integrated', '52_Content_Governance', 'duplicate governance source', '["governance_rules"]'::jsonb, 'inbound', 'governance_rule'),
  ('benchmark_integrated', '53_Content_Task_Tags', 'duplicate taxonomy source', '["task_tag_map"]'::jsonb, 'inbound', 'task_tag_rule'),
  ('benchmark_integrated', '54_Content_Prompts', 'duplicate prompt source', '["prompt_registry"]'::jsonb, 'inbound', 'prompt_definition'),
  ('benchmark_integrated', '55_Content_Simulations', 'duplicate simulation source', '["simulation_fixtures"]'::jsonb, 'inbound', 'simulation_fixture'),
  ('benchmark_integrated', '56_Content_Validation', 'duplicate validation source', '["validation_rules"]'::jsonb, 'inbound', 'validation_rule'),
  ('benchmark_integrated', '15_Analytics_Scorecard', 'performance and optimization scorecard', '["content_scorecards","analytics_snapshots","optimization_backlog"]'::jsonb, 'both', 'analytics_scorecard')
on conflict (source_key, sheet_name) do update
set purpose = excluded.purpose,
    target_tables = excluded.target_tables,
    direction = excluded.direction,
    runtime_object_type = excluded.runtime_object_type,
    updated_at = now();
