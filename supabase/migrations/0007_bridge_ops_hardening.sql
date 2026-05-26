create table if not exists public.notification_bridge (
  id uuid primary key default gen_random_uuid(),
  task_ref text,
  channel text not null default 'email',
  recipient text,
  status text not null default 'queued',
  safe boolean not null default false,
  evidence text,
  created_at timestamptz not null default now()
);

create table if not exists public.queue_control_events (
  id uuid primary key default gen_random_uuid(),
  queue_name text not null,
  action text not null,
  actor text not null default 'dashboard',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_heartbeats (
  id uuid primary key default gen_random_uuid(),
  worker_name text not null,
  surface text not null,
  status text not null default 'online',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
