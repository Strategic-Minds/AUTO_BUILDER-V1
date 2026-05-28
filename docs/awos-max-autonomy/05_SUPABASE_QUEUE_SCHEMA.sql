create table if not exists task_queue (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  priority integer not null default 50,
  approval_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists approval_gate (
  id uuid primary key default gen_random_uuid(),
  action_type text not null,
  target_system text not null,
  rationale text,
  status text not null default 'awaiting-approval',
  approver text,
  evidence_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists revenue_ledger (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  gross numeric(12,2) not null default 0,
  cost numeric(12,2) not null default 0,
  net numeric(12,2) generated always as (gross - cost) stored,
  stripe_event_id text,
  occurred_on date not null default current_date,
  notes text
);

create table if not exists content_calendar (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  asset text not null,
  caption text,
  offer_link text,
  status text not null default 'draft',
  scheduled_at timestamptz,
  approved_by text,
  created_at timestamptz not null default now()
);
