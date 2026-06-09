alter table if exists public.eden_assets
  add column if not exists asset_key text;

create unique index if not exists eden_assets_asset_key_uidx
  on public.eden_assets(asset_key)
  where asset_key is not null;

create index if not exists eden_assets_qa_approval_idx
  on public.eden_assets(qa_status, approval_state, created_at desc);

create index if not exists eden_assets_provider_type_idx
  on public.eden_assets(provider, asset_type, created_at desc);

insert into public.eden_workflow_capabilities (
  capability_key,
  capability_name,
  workflow_name,
  autonomy_level,
  risk_class,
  allowed_without_approval,
  approval_required,
  tool_scope,
  policy_payload,
  status
)
values (
  'image_asset_queue',
  'Autonomous missing image asset queue seeding',
  'IMAGE_INVENTORY',
  3,
  'low',
  true,
  false,
  '["supabase","google_drive_read","receipts"]'::jsonb,
  '{"external_writes":false,"paid_generation":false,"live_publish":false,"creates_placeholder_asset_records_only":true}'::jsonb,
  'active'
)
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
