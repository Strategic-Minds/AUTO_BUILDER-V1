-- AUTO BUILDER Execution Layer P0/P1
-- Migration: runtime jobs, receipts, failures, and approval queue
-- Status: schema stub only. Do not apply to production Supabase without explicit approval.

create extension if not exists "pgcrypto";

create table if not exists runtime_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  provider text not null,
  state text not null default 'queued',
  mode text not null default 'dry_run',
  risk text not null default 'low',
  priority integer not null default 50,
  payload jsonb not null default '{}'::jsonb,
  approval jsonb not null default '{}'::jsonb,
  receipt_id uuid,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists runtime_receipts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references runtime_jobs(id) on delete set null,
  action text not null,
  provider text not null,
  mode text not null default 'dry_run',
  status text not null,
  evidence jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  rollback_available boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists runtime_failures (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references runtime_jobs(id) on delete cascade,
  provider text not null,
  failure_type text not null,
  message text not null,
  retryable boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists runtime_approval_queue (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references runtime_jobs(id) on delete cascade,
  action_type text not null,
  provider text not null,
  required_phrase text,
  approval_status text not null default 'queued',
  requested_by text,
  approved_by text,
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists runtime_jobs_state_idx on runtime_jobs(state);
create index if not exists runtime_jobs_provider_idx on runtime_jobs(provider);
create index if not exists runtime_jobs_created_at_idx on runtime_jobs(created_at desc);
create index if not exists runtime_receipts_job_id_idx on runtime_receipts(job_id);
create index if not exists runtime_failures_job_id_idx on runtime_failures(job_id);
create index if not exists runtime_approval_queue_status_idx on runtime_approval_queue(approval_status);

-- RLS hardening is intentionally not included in this stub.
-- Add policies only after production Supabase approval and table ownership verification.
