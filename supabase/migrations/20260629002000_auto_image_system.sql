-- Auto Image System Tables
create table if not exists public.image_assets (
  id uuid primary key default gen_random_uuid(),
  asset_id text unique not null, brand text not null, finish_category text not null,
  platform text, aspect_ratio text, prompt_id text,
  status text not null default 'raw' check (status in ('raw','candidate','approved','rejected','superseded','published')),
  disclosure_label text not null default 'AI-generated concept image. Not an installed project photo.',
  qa_status text not null default 'pending' check (qa_status in ('pending','passed','failed','needs_revision')),
  approved_by text, notes text, drive_folder_id text, campaign text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.image_prompt_registry (
  id uuid primary key default gen_random_uuid(), prompt_id text unique not null,
  finish_category text not null, platform text, prompt_text text not null,
  realism_rules_applied boolean not null default false, status text not null default 'active',
  times_used int not null default 0, last_used_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.image_runs (
  id uuid primary key default gen_random_uuid(), run_key text unique not null,
  brand text not null, campaign text, prompt_count int not null default 0,
  generated_count int not null default 0, approved_count int not null default 0,
  rejected_count int not null default 0, status text not null default 'queued',
  receipt jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
alter table if exists public.image_assets enable row level security;
alter table if exists public.image_prompt_registry enable row level security;
alter table if exists public.image_runs enable row level security;
