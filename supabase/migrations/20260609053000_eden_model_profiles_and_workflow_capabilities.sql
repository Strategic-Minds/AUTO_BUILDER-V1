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

alter table if exists public.eden_models
  add column if not exists model_limit integer not null default 0,
  add column if not exists profile jsonb not null default '{}'::jsonb,
  add column if not exists personality jsonb not null default '{}'::jsonb,
  add column if not exists content_boundaries jsonb not null default '{}'::jsonb,
  add column if not exists automation_capabilities jsonb not null default '{}'::jsonb;

create table if not exists public.eden_model_profiles (
  id uuid primary key default gen_random_uuid(),
  model_id uuid references public.eden_models(id) on delete set null,
  external_key text not null unique,
  cohort text not null,
  display_name text not null,
  profile_payload jsonb not null default '{}'::jsonb,
  personality_payload jsonb not null default '{}'::jsonb,
  limits_payload jsonb not null default '{}'::jsonb,
  platform_profile_payload jsonb not null default '{}'::jsonb,
  status text not null default 'draft_ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_model_limits (
  id uuid primary key default gen_random_uuid(),
  external_key text not null unique,
  cohort text not null,
  daily_post_limit integer not null default 0,
  daily_reply_draft_limit integer not null default 0,
  weekly_video_draft_limit integer not null default 0,
  monthly_experiment_limit integer not null default 0,
  live_publish_allowed boolean not null default false,
  outbound_message_allowed boolean not null default false,
  requires_approval boolean not null default true,
  policy_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_faceless_pages (
  id uuid primary key default gen_random_uuid(),
  external_key text not null unique,
  display_name text not null,
  niche text not null,
  persona_payload jsonb not null default '{}'::jsonb,
  limits_payload jsonb not null default '{}'::jsonb,
  platform_targets jsonb not null default '[]'::jsonb,
  status text not null default 'draft_ready',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.eden_workflow_capabilities (
  id uuid primary key default gen_random_uuid(),
  capability_key text not null unique,
  capability_name text not null,
  workflow_name text not null,
  autonomy_level integer not null default 1,
  risk_class text not null default 'low',
  allowed_without_approval boolean not null default false,
  approval_required boolean not null default true,
  tool_scope jsonb not null default '[]'::jsonb,
  policy_payload jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['eden_model_profiles','eden_model_limits','eden_faceless_pages','eden_workflow_capabilities'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_service_role_all', table_name);
    execute format('create policy %I on public.%I for all to service_role using (true) with check (true)', table_name || '_service_role_all', table_name);
    execute format('drop trigger if exists %I on public.%I', table_name || '_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_current_timestamp_updated_at()', table_name || '_updated_at', table_name);
  end loop;
end $$;

with cohorts as (
  select * from (values
    ('male_18_25', '18-25 male digital creator', '18-25', 20, 'lifestyle, fitness, fashion, campus energy'),
    ('female_18_25', '18-25 female digital creator', '18-25', 20, 'beauty, style, wellness, daily-life storytelling'),
    ('male_25_50', '25-50 male digital creator', '25-50', 20, 'career, fitness, travel, modern luxury'),
    ('female_25_50', '25-50 female digital creator', '25-50', 20, 'wellness, fashion, business, lifestyle authority'),
    ('male_50_plus', '50+ male digital creator', '50+', 20, 'longevity, travel, mentorship, refined lifestyle'),
    ('female_50_plus', '50+ female digital creator', '50+', 20, 'confidence, longevity, fashion, travel, reinvention'),
    ('international', 'international digital creator', 'mixed', 20, 'global culture, travel, language, localized trend adaptation'),
    ('faceless', 'faceless brand page', 'brand', 20, 'faceless niche media, quote-led content, product education')
  ) as v(cohort, archetype, age_band, target_count, content_lane)
), generated as (
  select
    cohort,
    archetype,
    age_band,
    content_lane,
    idx,
    cohort || '_' || lpad(idx::text, 2, '0') as external_key,
    initcap(replace(cohort, '_', ' ')) || ' ' || lpad(idx::text, 2, '0') as display_name,
    case when cohort = 'faceless' then 'faceless_page' else 'model' end as registry_type
  from cohorts
  cross join generate_series(1, target_count) as idx
), upsert_models as (
  insert into public.eden_models (
    external_key,
    display_name,
    cohort,
    age_band,
    persona,
    status,
    risk_class,
    platform_targets,
    model_limit,
    profile,
    personality,
    content_boundaries,
    automation_capabilities
  )
  select
    external_key,
    display_name,
    cohort,
    age_band,
    archetype || ' focused on ' || content_lane,
    'draft_ready',
    'approval_gated',
    array['instagram','tiktok','youtube_shorts','x','website'],
    6,
    jsonb_build_object('registry_type', registry_type, 'cohort', cohort, 'age_band', age_band, 'content_lane', content_lane, 'image_status', 'missing_or_pending_upload', 'profile_status', 'draft_seeded'),
    jsonb_build_object('voice', case when cohort = 'faceless' then 'editorial, useful, conversion-aware' else 'warm, confident, aspirational, conversational' end, 'values', jsonb_build_array('brand-safe','approval-gated','audience-first','high-signal'), 'response_style', 'short-form social native with escalation for sensitive replies'),
    jsonb_build_object('adult_content','membership_only_and_approval_required','live_publish',false,'dm_outreach',false,'requires_human_approval_for_external_publish',true),
    jsonb_build_object('discover',true,'analyze',true,'draft_create',true,'quarantine',true,'approve',false,'schedule_after_approval',true,'live_publish',false,'auto_reply_draft',true,'auto_message_send',false)
  from generated
  on conflict (external_key) do update
  set display_name = excluded.display_name,
      cohort = excluded.cohort,
      age_band = excluded.age_band,
      persona = excluded.persona,
      status = excluded.status,
      risk_class = excluded.risk_class,
      platform_targets = excluded.platform_targets,
      model_limit = excluded.model_limit,
      profile = excluded.profile,
      personality = excluded.personality,
      content_boundaries = excluded.content_boundaries,
      automation_capabilities = excluded.automation_capabilities,
      updated_at = now()
  returning id, external_key
)
insert into public.eden_model_profiles (
  model_id,
  external_key,
  cohort,
  display_name,
  profile_payload,
  personality_payload,
  limits_payload,
  platform_profile_payload,
  status
)
select
  m.id,
  g.external_key,
  g.cohort,
  g.display_name,
  jsonb_build_object('age_band', g.age_band, 'archetype', g.archetype, 'content_lane', g.content_lane, 'registry_type', g.registry_type),
  jsonb_build_object('primary_voice', case when g.cohort = 'faceless' then 'faceless authority page' else 'digital model personality' end, 'reply_tone', 'brand-safe, friendly, concise'),
  jsonb_build_object('daily_post_limit', 6, 'daily_reply_draft_limit', 40, 'weekly_video_draft_limit', 7, 'monthly_experiment_limit', 4, 'approval_required', true),
  jsonb_build_object('instagram', 'draft', 'tiktok', 'draft', 'youtube_shorts', 'draft', 'x', 'draft', 'website', 'draft'),
  'draft_ready'
from generated g
join upsert_models m on m.external_key = g.external_key
on conflict (external_key) do update
set model_id = excluded.model_id,
    cohort = excluded.cohort,
    display_name = excluded.display_name,
    profile_payload = excluded.profile_payload,
    personality_payload = excluded.personality_payload,
    limits_payload = excluded.limits_payload,
    platform_profile_payload = excluded.platform_profile_payload,
    status = excluded.status,
    updated_at = now();

with generated as (
  select cohort, cohort || '_' || lpad(idx::text, 2, '0') as external_key
  from (values
    ('male_18_25', 20), ('female_18_25', 20), ('male_25_50', 20), ('female_25_50', 20),
    ('male_50_plus', 20), ('female_50_plus', 20), ('international', 20), ('faceless', 20)
  ) as v(cohort, target_count)
  cross join generate_series(1, target_count) as idx
)
insert into public.eden_model_limits (external_key, cohort, daily_post_limit, daily_reply_draft_limit, weekly_video_draft_limit, monthly_experiment_limit, live_publish_allowed, outbound_message_allowed, requires_approval, policy_payload)
select external_key, cohort, 6, 40, 7, 4, false, false, true,
  jsonb_build_object('approval_gate', 'required_before_live_external_action', 'quarantine_on_policy_failure', true, 'sandbox_first', true)
from generated
on conflict (external_key) do update
set cohort = excluded.cohort,
    daily_post_limit = excluded.daily_post_limit,
    daily_reply_draft_limit = excluded.daily_reply_draft_limit,
    weekly_video_draft_limit = excluded.weekly_video_draft_limit,
    monthly_experiment_limit = excluded.monthly_experiment_limit,
    live_publish_allowed = excluded.live_publish_allowed,
    outbound_message_allowed = excluded.outbound_message_allowed,
    requires_approval = excluded.requires_approval,
    policy_payload = excluded.policy_payload,
    updated_at = now();

with faceless as (
  select
    'faceless_' || lpad(idx::text, 2, '0') as external_key,
    'Faceless Brand Page ' || lpad(idx::text, 2, '0') as display_name,
    case ((idx - 1) % 5)
      when 0 then 'AI lifestyle media'
      when 1 then 'creator tools and templates'
      when 2 then 'wellness and confidence'
      when 3 then 'luxury inspiration and travel'
      else 'membership education and funnels'
    end as niche
  from generate_series(1, 20) as idx
)
insert into public.eden_faceless_pages (external_key, display_name, niche, persona_payload, limits_payload, platform_targets, status)
select
  external_key,
  display_name,
  niche,
  jsonb_build_object('voice', 'faceless editorial operator', 'content_style', 'short-form hooks, carousels, quote-led videos, CTA tests'),
  jsonb_build_object('daily_post_limit', 8, 'daily_reply_draft_limit', 60, 'weekly_video_draft_limit', 10, 'approval_required', true),
  '["instagram","tiktok","youtube_shorts","x","pinterest","website"]'::jsonb,
  'draft_ready'
from faceless
on conflict (external_key) do update
set display_name = excluded.display_name,
    niche = excluded.niche,
    persona_payload = excluded.persona_payload,
    limits_payload = excluded.limits_payload,
    platform_targets = excluded.platform_targets,
    status = excluded.status,
    updated_at = now();

insert into public.eden_workflow_capabilities (capability_key, capability_name, workflow_name, autonomy_level, risk_class, allowed_without_approval, approval_required, tool_scope, policy_payload, status)
values
  ('discover', 'Discovery intake and opportunity mapping', 'DISCOVER', 3, 'low', true, false, '["supabase","vercel_workflow","metricool_dry_run","shopify_read"]'::jsonb, '{"writes":"receipts_and_drafts_only"}'::jsonb, 'active'),
  ('analyze', 'Performance, audience, and content analysis', 'ANALYZE', 3, 'low', true, false, '["supabase","metricool_dry_run","analytics"]'::jsonb, '{"writes":"analysis_receipts"}'::jsonb, 'active'),
  ('create_draft', 'Draft content and media job creation', 'CREATE', 2, 'medium', true, false, '["supabase","heygen_dry_run","templates"]'::jsonb, '{"live_publish":false,"paid_generation_requires_approval":true}'::jsonb, 'active'),
  ('quarantine', 'Failed asset, policy, and connector quarantine', 'QUARANTINE', 3, 'low', true, false, '["supabase","vercel_workflow"]'::jsonb, '{"auto_route_failures":true}'::jsonb, 'active'),
  ('approve', 'Human approval gate and release decisioning', 'APPROVE', 1, 'high', false, true, '["supabase","admin_console"]'::jsonb, '{"human_required":true}'::jsonb, 'active'),
  ('schedule', 'Approved content scheduling', 'SCHEDULE', 2, 'medium', false, true, '["supabase","metricool","vercel_workflow"]'::jsonb, '{"external_schedule_requires_approval":true}'::jsonb, 'active'),
  ('validate', 'Preview validation and receipt capture', 'VALIDATE', 3, 'low', true, false, '["supabase","vercel","browser_tools"]'::jsonb, '{"preview_first":true}'::jsonb, 'active'),
  ('heal', 'Auto-fix and retry planning', 'HEAL', 2, 'medium', true, false, '["supabase","github","vercel_workflow"]'::jsonb, '{"production_mutation_requires_approval":true}'::jsonb, 'active'),
  ('dispatch', 'Approved external dispatch', 'DISPATCH', 1, 'high', false, true, '["metricool","shopify","google_drive","n8n"]'::jsonb, '{"external_write_requires_approval":true}'::jsonb, 'active'),
  ('memory_reflection', 'Memory, reflection, and optimization loop', 'OPTIMIZE', 3, 'low', true, false, '["supabase","memory","receipts"]'::jsonb, '{"no_external_publish":true}'::jsonb, 'active')
on conflict (capability_key) do update
set capability_name = excluded.capability_name,
    workflow_name = excluded.workflow_name,
    autonomy_level = excluded.autonomy_level,
    risk_class = excluded.risk_class,
    allowed_without_approval = excluded.allowed_without_approval,
    approval_required = excluded.approval_required,
    tool_scope = excluded.tool_scope,
    policy_payload = excluded.policy_payload,
    status = excluded.status,
    updated_at = now();
