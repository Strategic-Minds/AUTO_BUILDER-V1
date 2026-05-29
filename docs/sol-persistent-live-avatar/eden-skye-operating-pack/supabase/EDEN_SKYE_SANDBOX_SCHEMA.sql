-- Forbidden Fruit sandbox schema handoff
-- Parent company: Forbidden Fruit
-- First persona: Persona 001 - Eden Skye
-- Parent system: SOL Persistent Live Avatar Assistant v1
-- Intended environment: Supabase sandbox branch or isolated staging project only
-- Production safety: do not place this file in supabase/migrations or apply to production without explicit approval.

create extension if not exists pgcrypto;

create table if not exists public.forbidden_fruit_personas (
  id uuid primary key default gen_random_uuid(),
  persona_key text not null unique,
  display_name text not null,
  persona_number integer,
  parent_brand text not null default 'Forbidden Fruit',
  archetype text not null,
  audience_promise text not null,
  ai_disclosure text not null default 'This is a fictional AI persona for adult fantasy entertainment.',
  age_rating text not null default 'adult_only' check (age_rating in ('adult_only')),
  status text not null default 'draft' check (status in ('draft', 'needs_review', 'approved', 'live', 'archived')),
  policy_risk_level text not null default 'high' check (policy_risk_level in ('low', 'medium', 'high')),
  boundaries_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_by text not null default 'auto_builder',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.persona_assets (
  id uuid primary key default gen_random_uuid(),
  persona_key text not null references public.forbidden_fruit_personas(persona_key) on update cascade on delete restrict,
  asset_key text not null,
  asset_role text not null,
  asset_type text not null check (asset_type in ('image', 'video', 'audio', 'doc', 'csv', 'prompt', 'other')),
  content_rating text not null default 'adult_safe' check (content_rating in ('adult_safe', 'suggestive', 'restricted_review')),
  source_path text,
  public_url text,
  storage_provider text,
  status text not null default 'draft' check (status in ('draft', 'needs_review', 'approved', 'rejected', 'archived')),
  approval_required boolean not null default true,
  metadata_json jsonb not null default '{}'::jsonb,
  created_by text not null default 'auto_builder',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (persona_key, asset_key)
);

create table if not exists public.persona_prompt_bank (
  id uuid primary key default gen_random_uuid(),
  persona_key text not null references public.forbidden_fruit_personas(persona_key) on update cascade on delete restrict,
  tool_surface text not null check (tool_surface in ('metricool', 'repurpose', 'xyla', 'shopify', 'kling', 'heygen', 'openai', 'chat', 'voice', 'video', 'other')),
  prompt_name text not null,
  prompt_type text not null default 'generation',
  prompt_text text not null,
  negative_prompt text,
  reference_asset_key text,
  status text not null default 'draft' check (status in ('draft', 'needs_review', 'approved', 'rejected', 'archived')),
  risk_level text not null default 'high' check (risk_level in ('low', 'medium', 'high')),
  approval_required boolean not null default true,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_products (
  id uuid primary key default gen_random_uuid(),
  persona_key text not null references public.forbidden_fruit_personas(persona_key) on update cascade on delete restrict,
  platform text not null,
  content_pillar text not null,
  product_type text not null,
  title text not null,
  description text,
  caption text,
  first_comment text,
  asset_keys text[] not null default '{}',
  price_cents integer,
  scheduled_for timestamptz,
  timezone text not null default 'America/New_York',
  status text not null default 'draft' check (status in ('draft', 'needs_review', 'approved', 'scheduled', 'published', 'rejected', 'archived')),
  risk_level text not null default 'high' check (risk_level in ('low', 'medium', 'high')),
  content_rating text not null default 'adult_safe' check (content_rating in ('adult_safe', 'suggestive', 'restricted_review')),
  approval_request_id uuid,
  external_job_id text,
  external_url text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interaction_modes (
  id uuid primary key default gen_random_uuid(),
  persona_key text not null references public.forbidden_fruit_personas(persona_key) on update cascade on delete restrict,
  mode_key text not null,
  mode_type text not null check (mode_type in ('chat', 'voice', 'video', 'download', 'social', 'storefront')),
  display_name text not null,
  user_promise text not null,
  status text not null default 'draft' check (status in ('draft', 'needs_review', 'approved', 'live', 'disabled', 'archived')),
  risk_level text not null default 'high' check (risk_level in ('low', 'medium', 'high')),
  age_gate_required boolean not null default true,
  ai_disclosure_required boolean not null default true,
  approval_required boolean not null default true,
  moderation_required boolean not null default true,
  boundaries_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (persona_key, mode_key)
);

create table if not exists public.approval_events (
  id uuid primary key default gen_random_uuid(),
  persona_key text references public.forbidden_fruit_personas(persona_key) on update cascade on delete set null,
  target_table text not null,
  target_id uuid not null,
  action_requested text not null,
  risk_level text not null default 'high' check (risk_level in ('low', 'medium', 'high')),
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

create table if not exists public.signal_logs (
  id uuid primary key default gen_random_uuid(),
  persona_key text references public.forbidden_fruit_personas(persona_key) on update cascade on delete set null,
  content_product_id uuid references public.content_products(id) on delete set null,
  interaction_mode_id uuid references public.interaction_modes(id) on delete set null,
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

create index if not exists idx_forbidden_fruit_personas_status on public.forbidden_fruit_personas(status, policy_risk_level);
create index if not exists idx_persona_assets_status on public.persona_assets(persona_key, status, asset_role);
create index if not exists idx_persona_prompt_bank_surface on public.persona_prompt_bank(persona_key, tool_surface, status);
create index if not exists idx_content_products_status on public.content_products(persona_key, status, scheduled_for);
create index if not exists idx_interaction_modes_status on public.interaction_modes(persona_key, mode_type, status);
create index if not exists idx_approval_events_status on public.approval_events(persona_key, status, risk_level);
create index if not exists idx_signal_logs_content on public.signal_logs(persona_key, content_product_id, measured_at desc);

alter table public.forbidden_fruit_personas enable row level security;
alter table public.persona_assets enable row level security;
alter table public.persona_prompt_bank enable row level security;
alter table public.content_products enable row level security;
alter table public.interaction_modes enable row level security;
alter table public.approval_events enable row level security;
alter table public.signal_logs enable row level security;

-- Read-only authenticated review access. Mutations should be server-side only through governed routes.
do $$ begin
  create policy "read forbidden fruit personas" on public.forbidden_fruit_personas for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read persona assets" on public.persona_assets for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read persona prompt bank" on public.persona_prompt_bank for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read content products" on public.content_products for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read interaction modes" on public.interaction_modes for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read approval events" on public.approval_events for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "read signal logs" on public.signal_logs for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- Optional seed data for sandbox validation only.
insert into public.forbidden_fruit_personas (persona_key, display_name, persona_number, archetype, audience_promise, status, policy_risk_level, boundaries_json, metadata_json)
values
  (
    'eden-skye',
    'Eden Skye',
    1,
    'premium brunette luxury muse',
    'Cinematic adult AI fantasy entertainment with clear fictional disclosure and governed interaction boundaries.',
    'needs_review',
    'high',
    '{"required":"adult-only, fictional AI disclosure, no real-person impersonation, no minors, no coercive or non-consensual scenarios","blocked":["underage or ambiguous age presentation","real-person impersonation","unsupported relationship claims","medical/legal/financial claims","unapproved explicit generation"]}'::jsonb,
    '{"parent_company":"Forbidden Fruit","persona_label":"Persona 001","source":"current Eden Skye operating pack"}'::jsonb
  )
on conflict (persona_key) do update set
  display_name = excluded.display_name,
  parent_brand = excluded.parent_brand,
  archetype = excluded.archetype,
  audience_promise = excluded.audience_promise,
  boundaries_json = excluded.boundaries_json,
  metadata_json = excluded.metadata_json,
  updated_at = now();

insert into public.persona_assets (persona_key, asset_key, asset_role, asset_type, source_path, status, content_rating, metadata_json)
values
  ('eden-skye', 'eden-skye-01-brand-hero', 'brand_hero', 'image', 'external_asset_store_required', 'draft', 'adult_safe', '{"ratio":"4:5","use":"landing page, campaign cover"}'),
  ('eden-skye', 'eden-skye-02-clean-headshot', 'clean_headshot', 'image', 'external_asset_store_required', 'draft', 'adult_safe', '{"ratio":"1:1","use":"profile, press, HeyGen reference"}'),
  ('eden-skye', 'eden-skye-06-social-thumbnail', 'thumbnail_background', 'image', 'external_asset_store_required', 'draft', 'adult_safe', '{"ratio":"16:9","use":"thumbnail with copy space"}')
on conflict (persona_key, asset_key) do nothing;

insert into public.persona_prompt_bank (persona_key, tool_surface, prompt_name, prompt_type, prompt_text, negative_prompt, reference_asset_key, risk_level, metadata_json)
values
  ('eden-skye', 'kling', 'Rooftop glance', 'image_to_video', 'Slow cinematic push-in. Eden Skye turns slightly toward camera as sunset light catches her hair; city skyline glows behind her; luxury rooftop atmosphere; natural movement only. Keep the result adult, fictional, suggestive-safe, and non-explicit.', 'extra fingers, distorted face, harsh motion, warped skyline, text, watermark, explicit nudity, underage cues, real-person resemblance', 'eden-skye-01-brand-hero', 'high', '{"approval_gate":"visual_identity_and_policy"}'),
  ('eden-skye', 'heygen', 'Consistency Hook', 'avatar_script', 'There is a reason Eden Skye feels consistent across every asset. She is not a real private person. She is a fictional AI persona built from rules: face, voice, visual world, content boundaries, and approval gates.', null, 'eden-skye-02-clean-headshot', 'high', '{"approval_gate":"voice_identity_and_ai_disclosure"}')
on conflict do nothing;

insert into public.content_products (persona_key, platform, content_pillar, product_type, title, description, caption, asset_keys, status, risk_level, content_rating, metadata_json)
values
  ('eden-skye', 'Instagram', 'Forbidden Fruit Teaser', 'social_teaser', 'Visual reset', 'Social-safe teaser for Persona 001.', 'There is a version of fantasy that is built with rules before it ever reaches the room. AI persona. Fictional. Adult-only brand world.', array['eden-skye-01-brand-hero'], 'draft', 'high', 'adult_safe', '{"source":"metricool-calendar-seed","parent_company":"Forbidden Fruit"}'),
  ('eden-skye', 'Shopify', 'Persona Download', 'digital_download', 'Eden Skye cinematic intro pack', 'Draft product concept for a downloadable fictional AI persona video/image pack. Not approved for live checkout.', null, array['eden-skye-02-clean-headshot'], 'needs_review', 'high', 'adult_safe', '{"source":"shopify-offer-asset-sheet","requires_policy_validation":true}')
on conflict do nothing;

insert into public.interaction_modes (persona_key, mode_key, mode_type, display_name, user_promise, status, risk_level, boundaries_json, metadata_json)
values
  ('eden-skye', 'eden-chat-preview', 'chat', 'Eden Skye Chat Preview', 'Scripted adult fantasy chat with clear AI disclosure and blocked-topic moderation.', 'draft', 'high', '{"requires":["age_gate","ai_disclosure","moderation","privacy_notice"],"blocked":["underage content","real-person impersonation","coercive or non-consensual roleplay","medical/legal/financial advice"]}'::jsonb, '{"launch_blocker":"moderation and platform policy validation required"}'::jsonb),
  ('eden-skye', 'eden-video-downloads', 'download', 'Eden Skye Video Downloads', 'Approved downloadable fictional persona media after storage, payment, and storefront policy validation.', 'draft', 'high', '{"requires":["age_gate","ai_disclosure","content_rating","payment_policy_validation"],"blocked":["unapproved explicit content","unreviewed public links"]}'::jsonb, '{"launch_blocker":"payment and storage policy validation required"}'::jsonb)
on conflict (persona_key, mode_key) do nothing;
