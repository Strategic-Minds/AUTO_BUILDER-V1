create table if not exists build_runs (
  id text primary key,
  title text not null,
  stage text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists queue_items (
  id text primary key,
  build_run_id text references build_runs(id) on delete cascade,
  title text not null,
  owner text not null,
  lane text not null check (lane in ('ready', 'awaiting-approval', 'blocked', 'done')),
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  platform text not null,
  approval_state text not null check (approval_state in ('pending', 'approved', 'rejected')),
  evidence text not null,
  next_action text not null,
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  id text primary key,
  build_run_id text references build_runs(id) on delete cascade,
  subject text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  rule text not null,
  updated_at timestamptz not null default now()
);

create table if not exists integration_snapshots (
  id bigint generated always as identity primary key,
  provider text not null,
  status text not null,
  detail text not null,
  captured_at timestamptz not null default now()
);

create table if not exists validation_reports (
  id bigint generated always as identity primary key,
  status text not null,
  report jsonb not null,
  captured_at timestamptz not null default now()
);

alter table build_runs enable row level security;
alter table queue_items enable row level security;
alter table approvals enable row level security;
alter table integration_snapshots enable row level security;
alter table validation_reports enable row level security;

create policy "service role manages build_runs"
on build_runs for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manages queue_items"
on queue_items for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manages approvals"
on approvals for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manages integration_snapshots"
on integration_snapshots for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role manages validation_reports"
on validation_reports for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
