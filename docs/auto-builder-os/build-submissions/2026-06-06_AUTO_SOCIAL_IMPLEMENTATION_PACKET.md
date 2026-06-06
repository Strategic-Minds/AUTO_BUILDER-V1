# AUTO SOCIAL Implementation Packet

Date: 2026-06-06
Status: BRANCH-SAFE IMPLEMENTATION PACKET
Branch: `auto-builder/os-v1-backend-bridge-clean-20260606`
Scope: Universal Auto Social system inside AUTO BUILDER OS.

## PHASE / STEP

AUTO SOCIAL DOC MODE / STEP 1: source-aligned implementation packet.

## TODO

- [x] Search GitHub/repo truth.
- [x] Search Google Drive/source docs.
- [x] Check autonomous GPT bridge surfaces.
- [x] Compare GitHub and Drive findings.
- [x] Create branch-safe implementation packet.
- [ ] Implement backend routes on a sandbox branch.
- [ ] Implement Supabase schema on a development branch only.
- [ ] Implement v0/frontend panels.
- [ ] Run draft-only social smoke.
- [ ] Stop before live publishing or production mutation.

## Source Truth Searched

### GitHub / Repo Truth

- `docs/auto-builder-os/finalization/2026-06-06/05_AUTO_SOCIAL_SYSTEM_BLUEPRINT.md`
- `docs/auto-builder-os/operating-protocols/2026-06-06_AUTO_SOCIAL_PHASE_LOCK.md`
- `docs/bridges/AUTONOMOUS_BRIDGE_MATRIX.md`
- `docs/auto-builder-os/finalization/2026-06-06/00_WHATS_LEFT_MASTER_TODO.md`

### Google Drive / Source Docs

- `AUTO_SOCIAL_BOSS_OS_CONTROL_CENTER`
- `SMA_Social_Warp_Speed_Growth_Workbook_OS.xlsx`
- `Eden Skye Master Media Router - GPT Images + HeyGen Videos - 2026-06-05`
- `Eden Skye Studios Approval Control Plane v1 - 2026-06-05`

### Autonomous GPT Bridge Surface

AUTO BUILDER 2 bridge inspection exposed:

- Source repo: `Strategic-Minds/AUTO_BUILDER`
- Sandbox repo: `Strategic-Minds/SANDBOX`
- Frontend repo: `Strategic-Minds/FRONTEND`
- Providers: GitHub, Vercel, Supabase, Shopify, OpenAI, Groq, Codex, Google Workspace, Xyla, Opus
- Factory surfaces: `/api/factory/readiness`, `/api/factory/router`, `/api/factory/build-packet`, `/api/factory/capability-test`, `/api/bridge/providers/runtime-status`, `/api/bridge/eden/runtime`, `/api/bridge/github/workflows`, `/api/bridge/vercel/redeploy`, `/api/cron/factory-readiness`

## Verified Alignment

GitHub and Drive agree on these operating rules:

- Auto Social is draft-first and approval-controlled.
- Live publishing is blocked until explicitly approved.
- Public posting, email/SMS sending, paid ads, pricing changes, governance changes, Supabase schema changes, Vercel env changes, Shopify pricing changes, and payment actions are protected gates.
- Drive is a source-of-truth layer for command centers, approval queues, media routers, content plants, and receipts.
- GitHub is the source for code, docs, routes, schemas, workflows, and build packets.
- Metricool is the preferred scheduler/analytics route where connected.
- HeyGen is the preferred avatar/talking-video route where approved.
- Xyla is treated as draft/creative route where connected.
- GPT/OpenAI image generation is preferred for still-image generation where available.
- The 10,000 followers/month target is an optimization target, not a guaranteed result.

## System Boundary

Auto Social must become a universal module generated for every AUTO BUILDER system-in-a-box.

It covers:

- Strategy
- Content calendar
- Hook/caption/script/image/video prompt banks
- Asset queues
- Approval queues
- Metricool draft scheduling packets
- HeyGen video job packets
- Xyla/GPT image prompt packets
- Analytics snapshots
- Repurposing tasks
- Optimization loops
- Bridge receipts

It does not autonomously perform:

- live social publishing
- auto-DMs
- mass engagement
- account setting changes
- paid ad spend
- customer messages
- payment/store/price mutation
- production deploys
- production Supabase migration

## Backend Plan

Add or reconcile these Next.js API routes:

- `GET /api/social/status`
- `POST /api/social/strategy`
- `POST /api/social/calendar`
- `POST /api/social/content-batch`
- `POST /api/social/assets`
- `POST /api/social/approvals`
- `POST /api/social/publish-drafts`
- `POST /api/social/analytics`
- `POST /api/social/repurpose`
- `POST /api/social/optimize`
- `GET /api/cron/social-bridge`

Route behavior:

- Validate phase lock before generating content.
- Write draft-only records unless approval status permits a wider action.
- Return secret names/status only; never return secret values.
- Emit bridge events for phase transitions, queue writes, draft generation, approvals, failures, retries, and receipts.
- Store errors in dead-letter records when retry is unsafe.

## Supabase Development Schema Plan

Create on a Supabase development branch first:

- `social_projects`
- `social_strategies`
- `social_platform_accounts`
- `social_content_pillars`
- `social_calendar_items`
- `social_content_drafts`
- `social_assets`
- `social_video_jobs`
- `social_approval_requests`
- `social_schedule_drafts`
- `social_publish_receipts`
- `social_analytics_snapshots`
- `social_replication_tasks`
- `social_bridge_events`
- `social_dead_letters`

Minimum required fields:

- `id uuid primary key`
- `system_id uuid/text`
- `source_system text`
- `status text`
- `approval_status text`
- `payload jsonb`
- `metadata jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

Security:

- RLS enabled on all tables.
- Service-role writes only through backend routes.
- User/team reads scoped by project/system ownership.
- No secrets in table payloads.

## Bridge/Event-Bus Plan

Every Auto Social action emits a bridge receipt:

- `social.discovery.completed`
- `social.brand.options.generated`
- `social.docs.created`
- `social.strategy.generated`
- `social.calendar.generated`
- `social.content.draft.created`
- `social.asset.job.queued`
- `social.video.job.queued`
- `social.approval.requested`
- `social.schedule.draft.created`
- `social.analytics.snapshot.ingested`
- `social.optimization.completed`
- `social.replication.task.created`
- `social.dead_letter.created`

Bridge policy:

- Use autonomous GPT bridge for command/event/audit/queue/receipt/handoff behavior.
- If runtime bridge is unavailable, write a repo/Drive handoff packet and keep the bridge repair TODO open.
- All live actions require approval receipts.

## Frontend Plan

The v0 AUTO BUILDER OS frontend must add an Auto Social control plane with these panels:

- Phase/step lock panel
- GitHub + Drive source evidence panel
- Bridge status and receipts panel
- Strategy and content pillars panel
- 7-day launch calendar panel
- 30-day growth calendar panel
- Content draft queue
- Image/creative asset queue
- HeyGen video queue
- Metricool schedule draft queue
- Approval queue
- Analytics dashboard
- Optimization recommendations
- Dead-letter/self-heal panel
- Environment/account checklist

Frontend must submit governed commands only. It must not expose secret values or provide live publish buttons unless approval policy is widened.

## Agent Topology

Required agents:

- Social Strategy Agent
- Hook Agent
- Script Agent
- Caption Agent
- Creative/Image Agent
- HeyGen Video Agent
- Approval/Governance Agent
- Scheduler Agent
- Analytics Agent
- Repurposing Agent
- Recovery/Self-Heal Agent
- Bridge Receipt Agent

Each agent requires:

- phase scope
- allowed actions
- blocked actions
- data inputs
- data outputs
- receipt event names
- failure handling

## Workflow Cadence

Default cadence:

- Every 5 minutes: cron checks approved queued work, retries safe dead letters, logs heartbeat.
- Daily: generate/check 3 posts per account, review queue, draft next content, check failed schedules.
- Weekly: discover new topic/market/content angles, review analytics, improve content pillars, adjust tests.
- Biweekly: refresh brand angles, campaign themes, offers, and workflow assumptions.
- Monthly: evaluate follower growth, content winners, offer conversion, platform mix, and replication opportunities.

Cron rule:

- Non-mutating by default unless approved queued work exists.
- Live publish remains blocked unless explicit approval policy is installed.

## Environment Names Only

Required env names/status surface:

- `OPENAI_API_KEY`
- `AI_GATEWAY_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `GOOGLE_CHAT_WEBHOOK_URL`
- `METRICOOL_API_KEY`
- `METRICOOL_BRAND_ID`
- `HEYGEN_API_KEY`
- `XYLA_API_KEY`
- `GITHUB_TOKEN`
- `VERCEL_TOKEN`
- `BRIDGE_SECRET`
- `EDEN_RUNTIME_BRIDGE_TOKEN`

Never display values.

## Validation And Smoke Order

1. Heartbeat.
2. Secret names/status only.
3. GitHub source read.
4. Drive source read.
5. Bridge readiness/status.
6. Harmless social strategy draft.
7. Harmless calendar draft.
8. Harmless content draft.
9. Harmless asset job queued with no provider spend.
10. Harmless HeyGen script packet only.
11. Metricool schedule export packet only.
12. Approval queue write.
13. Analytics snapshot mock ingest.
14. Dead-letter/self-heal test.
15. Browser screenshot of Auto Social frontend panel.
16. Git status / PR evidence.

## Acceptance Criteria

Auto Social is ready for sandbox implementation when:

- GitHub and Drive source searches are recorded.
- Bridge status is recorded or bridge blocker is logged.
- Routes are implemented draft-first.
- Supabase schema is dev-branch only and RLS-safe.
- Frontend panels display phase, queues, approvals, receipts, blockers, and analytics.
- Smoke evidence is clean.
- Production/live publish gates remain closed.

## Blockers

- Runtime Metricool/Xyla/HeyGen adapters were not verified as executable in this pass.
- Live Supabase schema was not inspected or mutated in this pass.
- v0 frontend repository state was not inspected in this pass.
- Production environment variables were not modified.
- Live social accounts were not connected or changed.

## Workarounds

- Missing Metricool: export scheduler CSV/packet and keep draft queue.
- Missing HeyGen: create script/storyboard packet and hold video job.
- Missing Xyla: create image/creative prompt packet and hold asset job.
- Missing Supabase: write JSON/Drive/GitHub packet receipts until dev schema is approved.
- Missing frontend sync: create v0 UI implementation packet and require preview screenshot smoke.
- Missing runtime bridge: create bridge repair TODO and use repo/Drive handoff receipts.

## Next Implementation Order

1. Add Supabase dev migration for Auto Social tables and RLS policies.
2. Add server-side social route handlers with draft-only policy checks.
3. Add bridge event emitters and dead-letter handling.
4. Add 5-minute cron social bridge checker.
5. Add v0 Auto Social frontend panels.
6. Add GitHub Actions smoke workflow for social draft path.
7. Run full smoke and screenshot evidence.
8. Stop at approval gate before live publishing or production mutation.
