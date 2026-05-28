-- Eden Skye sandbox schema handoff
-- Parent system: SOL Persistent Live Avatar Assistant v1
-- Intended environment: Supabase sandbox branch or isolated staging project only
-- Production safety: do not place this file in supabase/migrations or apply to production without explicit approval.

create extension if not exists pgcrypto;

create table if not exists public.eden_persona_assets (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null default 'eden-skye',
  asset_key text not null,
  asset_role text not null,
  asset_type text not null check (asset_type in ('image', 'video', 'audio', 'doc', 'csv', 'prompt', 'other')),
  source_path text,
  public_url text,
  storage_provider text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'archived')),
  approval_required boolean not null default true,
  metadata_json jsonb not null default '{}'::jsonb,
  created_by text not null default 'auto_builder',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (persona_id, asset_key)
);

create table if not exists public.eden_prompt_bank (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null default 'eden-skye',
  tool_surface text not null check (tool_surface in ('metricool', 'repurpose', 'xyla', 'shopify', 'kling', 'heygen', 'openai', 'other')),
  prompt_name text not null,
  prompt_type text not null default 'generation',
  prompt_text text not null,
  negative_prompt text,
  reference_asset_key text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected', 'archived')),
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  approval_required boolean not null default true,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_content_queue (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null default 'eden-skye',
  platform text not null,
  content_pillar text not null,
  content_type text not null,
  title text,
  caption text,
  first_comment text,
  asset_keys text[] not null default '{}',
  scheduled_for timestamptz,
  timezone text not null default 'America/New_York',
  status text not null default 'draft' check (status in ('draft', 'needs_review', 'approved', 'scheduled', 'published', 'rejected', 'archived')),
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  approval_request_id uuid,
  external_job_id text,
  external_url text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_approval_events (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null default 'eden-skye',
  target_table text not null,
  target_id uuid not null,
  action_requested text not null,
  risk_level text not null default 'medium' check (risk_level in ('low', 'medium', 'high')),
  status text not null default 'needs_review' check (status in ('needs_review', 'approved', 'rejected', 'superseded')),
  requested_by text not null default 'auto_builder',
  reviewed_by text,
  reviewed_at timestamptz,
  evidence_json jsonb not null default '{}'::jsonb,
  blocker text,
  workaround text,
  rollback_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.eden_signal_logs (
  id uuid primary key default gen_random_uuid(),
  persona_id text not null default 'eden-skye',
  content_queue_id uuid references public.eden_content_queue(id) on delete set null,
  platform text not null,
  measured_at timestamptz not null default now(),
  impressions integer,
  views integer,
  watch_time_seconds integer,
  likes integer,
  comments integer,
  saves integer,
  shares integer,
  clicks integer,
  email_opt_ins integer,
  product_views integer,
  purchases integer,
  revenue_cents integer,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_eden_persona_assets_status on public.eden_persona_assets(persona_id, status, asset_role);
create index if not exists idx_eden_prompt_bank_surface on public.eden_prompt_bank(persona_id, tool_surface, status);
create index if not exists idx_eden_content_queue_status on public.eden_content_queue(persona_id, status, scheduled_for);
create index if not exists idx_eden_approval_events_status on public.eden_approval_events(persona_id, status, risk_level);
create index if not exists idx_eden_signal_logs_content on public.eden_signal_logs(persona_id, content_queue_id, measured_at desc);

alter table public.eden_persona_assets enable row level security;
alter table public.eden_prompt_bank enable row level security;
alter table public.eden_content_queue enable row level security;
alter table public.eden_approval_events enable row level security;
alter table public.eden_signal_logs enable row level security;

-- Read-only authenticated review access. Mutations should be server-side only through governed routes.
do $$ begin
  create policy "read eden persona assets" on public.eden_persona_assets for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read eden prompt bank" on public.eden_prompt_bank for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read eden content queue" on public.eden_content_queue for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read eden approval events" on public.eden_approval_events for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read eden signal logs" on public.eden_signal_logs for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- Optional seed data for sandbox validation only.
insert into public.eden_persona_assets (asset_key, asset_role, asset_type, source_path, status, metadata_json)
values
  ('eden-skye-01-brand-hero', 'brand_hero', 'image', 'external_asset_store_required', 'draft', '{"ratio":"4:5","use":"landing page, campaign cover"}'),
  ('eden-skye-02-clean-headshot', 'clean_headshot', 'image', 'external_asset_store_required', 'draft', '{"ratio":"1:1","use":"profile, press, HeyGen reference"}'),
  ('eden-skye-06-social-thumbnail', 'thumbnail_background', 'image', 'external_asset_store_required', 'draft', '{"ratio":"16:9","use":"thumbnail with copy space"}')
on conflict (persona_id, asset_key) do nothing;

insert into public.eden_prompt_bank (tool_surface, prompt_name, prompt_type, prompt_text, negative_prompt, reference_asset_key, risk_level)
values
  ('kling', 'Rooftop glance', 'image_to_video', 'Slow cinematic push-in. Eden Skye turns slightly toward camera as sunset light catches her hair; city skyline glows behind her; luxury rooftop atmosphere; natural movement only.', 'extra fingers, distorted face, harsh motion, warped skyline, text, watermark', 'eden-skye-01-brand-hero', 'medium'),
  ('heygen', 'Consistency Hook', 'avatar_script', 'There is a reason Eden Skye looks consistent across every image. It is not one prompt. It is a character system: face rules, visual world, voice, content pillars, and approval gates.', null, 'eden-skye-02-clean-headshot', 'medium')
on conflict do nothing;

insert into public.eden_content_queue (platform, content_pillar, content_type, title, caption, asset_keys, status, risk_level, metadata_json)
values
  ('Instagram', 'Luxury AI Lifestyle', 'reel', 'Visual reset', 'There is a version of you that enters quietly and changes the room. Save this for your next visual reset.', array['eden-skye-01-brand-hero'], 'draft', 'medium', '{"source":"metricool-calendar-seed"}'),
  ('YouTube Shorts', 'AI Muse / Digital Twin', 'short', 'Character consistency', 'How I keep Eden Skye consistent across AI images, video, captions, and offers.', array['eden-skye-02-clean-headshot'], 'draft', 'medium', '{"source":"metricool-calendar-seed"}');
