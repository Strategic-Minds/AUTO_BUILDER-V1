-- Eden Skye 24/7 queue extension.
-- Apply to Supabase branch/sandbox first. Production migration requires approval.

create schema if not exists autobuilder;

create table if not exists autobuilder.eden_247_operating_events (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  event_type text not null,
  lane text not null,
  target_system text not null,
  status text not null default 'pending',
  priority int not null default 100,
  payload jsonb not null default '{}'::jsonb,
  receipt jsonb not null default '{}'::jsonb,
  approval_required boolean not null default false,
  next_run_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint eden_247_event_status_check check (
    status in ('pending','running','succeeded','failed','approval_hold','blocked','cancelled')
  )
);

alter table autobuilder.eden_247_operating_events enable row level security;
grant select, insert, update, delete on autobuilder.eden_247_operating_events to service_role;

insert into autobuilder.eden_247_operating_events (
  request_id,
  event_type,
  lane,
  target_system,
  status,
  priority,
  payload,
  approval_required
)
values
(
  'eden-247-bootstrap',
  'continuous_tick',
  'orchestration',
  'auto_builder',
  'pending',
  1,
  jsonb_build_object(
    'rrule', 'RRULE:FREQ=MINUTELY;INTERVAL=5',
    'systems', jsonb_build_array('git','drive','supabase','vercel','shopify','metricool_or_xyla','heygen'),
    'locks', jsonb_build_object(
      'production', true,
      'shopify_mutation', true,
      'social_publishing', true,
      'payment_changes', true
    )
  ),
  false
);
