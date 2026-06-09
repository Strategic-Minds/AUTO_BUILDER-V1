# Eden Skye Studios Operating Backend Build

Status: branch-safe implementation for Vercel preview and Supabase migration review.

## Installed Surfaces

- `/admin/eden-skye`
- `/api/eden-skye/os`
- `/api/eden-skye/os/{discover|analyze|create|quarantine|approve|schedule|validate|heal|dispatch}`
- `/api/eden-skye/workflows`
- `/api/eden-skye/workflows/{discover|analyze|create_drafts|image_inventory|asset_linking|quarantine|approval_queue|schedule_drafts|validate|heal|memory_reflection|dispatch_approved}`
- `/api/cron/eden-skye-five-minute`
- `supabase/migrations/20260609050000_eden_skye_operating_system.sql`
- `supabase/migrations/20260609053000_eden_model_profiles_and_workflow_capabilities.sql`
- `supabase/migrations/20260609060620_eden_image_asset_queue.sql`
- `supabase/migrations/20260609062702_eden_draft_ops_queue_keys.sql`
- `supabase/migrations/20260609062835_eden_draft_ops_queue_conflict_targets.sql`

## Operating Model

Supabase becomes the live operating backend for models, assets, content, engagement, experiments, agent runs, memory, and receipts. Vercel serves the website/admin command center, workflow supervisor, child workflow routes, and five-minute validation heartbeat. GitHub remains the review, deployment, rollback, and source-truth layer.

## Durable Workflow Supervisor

The Prompt 2 workflow layer is implemented as a build-safe Vercel route contract that can be validated in preview and later swapped to native WDK step primitives without changing the external control-plane routes.

- Supervisor route: `/api/eden-skye/workflows`
- Cron route: `/api/cron/eden-skye-five-minute`
- Child workflows: discover, analyze, create_drafts, image_inventory, asset_linking, quarantine, approval_queue, schedule_drafts, validate, heal, memory_reflection, dispatch_approved
- Persistence targets: `eden_receipts` and `eden_agent_runs`
- Simulation mode: default on
- External writes: locked
- Production actions: locked
- Approval-gated children: asset_linking, approval_queue, schedule_drafts, dispatch_approved

## Automated Image Asset Queue

The `image_inventory` child workflow now creates a durable draft asset queue in `eden_assets` when the Supabase preview migration is applied.

What it does:

- Loads all `eden_models` records.
- Creates or updates one queued image-asset placeholder per model/faceless account using `asset_key`.
- Stores brand-safe prompt instructions for model profile images or faceless page visuals.
- Marks records as `qa_status = missing_or_pending_upload` and `approval_state = draft`.
- Records that paid generation, Drive upload, external scheduling, and live publishing are not allowed from this step.

What it does not do:

- No image generation.
- No paid HeyGen/image generation.
- No Google Drive upload, move, or archive write.
- No social posting, comment, reply, DM, or external scheduling.
- No production migration.

## Draft Operating Queue

The workflow package also seeds draft-only operating queues after the Supabase preview branch has the draft queue migrations.

- `eden_content_items`: first draft-only calendar item per model/faceless account.
- `eden_engagement_tickets`: approval-gated response templates for comments, replies, messages, waitlist, brand intake, and quarantine.
- `eden_experiments`: website, membership, model, faceless-page, image-style, and scheduling A/B tests.
- `eden_memory_entries`: durable operating memory and self-reflection facts for the Eden Skye loop.

These records are idempotent, receipt-gated, and locked from external dispatch.

## Safety Gates

The implementation is draft-first. It does not perform live publishing, outbound comments, replies, DMs, adult-content release, payment activation, Shopify/Xyla publication, n8n dispatch, paid media generation, Google Drive archive writes, or production Supabase migration.

## Image And Media Library Contract

The workflow layer treats image coverage as a first-class validation target. The current target remains 160 model/faceless account records. The image inventory child workflow can seed missing asset records. The asset linking child workflow remains approval-gated until approved Drive image IDs, URLs, or generated image packets are available.

Required image states:

- `missing_or_pending_upload` for uncreated or unuploaded assets
- `drive_found_unlinked` for discovered Drive images that are not yet attached to model records
- `draft_linked` for image records linked in Supabase but not approved for publication
- `qa_passed` for assets that pass review
- `quarantined` for failed, unsafe, duplicate, or low-quality assets
- `approved_for_schedule` only after owner approval

## Next Validation

1. Let Vercel build preview from PR #35.
2. Let the Supabase preview branch apply `20260609060620_eden_image_asset_queue.sql`, `20260609062702_eden_draft_ops_queue_keys.sql`, and `20260609062835_eden_draft_ops_queue_conflict_targets.sql`.
3. Smoke `/api/eden-skye/os` and every operation route.
4. Smoke `/api/eden-skye/workflows` and every child workflow route.
5. Confirm `image_inventory` creates or updates 160 `eden_assets` queue records.
6. Confirm `create_drafts`, `approval_queue`, `schedule_drafts`, and `memory_reflection` seed draft-only queues.
7. Confirm workflow supervisor writes receipts and agent run records when Supabase env is configured.
8. Smoke `/admin/eden-skye`.
9. Confirm cron returns 401 when protected or supervisor results when authorized.
10. Approve Supabase migration separately before applying anywhere beyond the preview branch.
11. Approve any real Drive upload/import/move or paid image/video generation separately.
