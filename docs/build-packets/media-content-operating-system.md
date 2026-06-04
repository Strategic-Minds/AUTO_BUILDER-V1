# Media and Content Operating System Build Packet

## 1. Current Status

AUTO BUILDER already has a factory bridge, router, capability matrix, connector registry, template library, reverse-engineering lanes, Playwright worker, Vercel worker, Supabase worker, and Drive upload worker. This packet installs the missing media/content operating system layer for future projects.

## 2. Source Truth

Grounded sources:

- `Strategic-Minds/AUTO_BUILDER`
- `Strategic-Minds/NASHVILLERESINWORX`
- `factory/capability-matrix.json`
- `factory/connector-ops.json`
- `factory/template-library.json`
- `factory/reverse-engineering-lanes.json`
- Nashville Drive Marketing folder `1IgbbiNq3PUQv82KcoUe3sDJ6FNUmX5nZ`

## 3. System Boundary

This system owns:

- folder and file generation
- image generation and asset management
- video scripts, storyboards, avatar workflows, and video production queues
- voiceover and sound generation queues
- code generation packets and patch queues
- content ideas, schedules, posts, responses, and analytics loops
- CMS-style management for assets, campaigns, approvals, quarantine, and receipts

It does not auto-publish, mutate production, spend money, or reply externally without an approval gate.

## 4. Frontend Plan

Build an admin control plane with these views:

- Command Center: blockers, next actions, gate status, live systems
- Asset Library: logos, gallery, product images, process assets, generated media
- Content Calendar: channel schedule, campaign status, approvals
- Generator Console: image, video, voice, copy, code, folder/file generation
- Review Queue: approve, revise, quarantine, publish-ready
- Analytics Board: post metrics, lead metrics, conversion metrics, learning loops
- Engagement Desk: comments, DMs, suggested replies, response policy
- System Map: repos, Drive folders, Vercel projects, Supabase tables, agents, workers

## 5. Backend Plan

Add persistent tables or equivalent storage for:

- `brands`
- `projects`
- `asset_sources`
- `assets`
- `content_ideas`
- `content_briefs`
- `content_items`
- `campaigns`
- `publish_jobs`
- `engagement_threads`
- `performance_metrics`
- `optimization_actions`
- `agent_runs`
- `tool_receipts`
- `approval_events`
- `quarantine_items`

Worker actions:

- `drive.copyFileToFolder`
- `drive.uploadFileToFolder`
- `image.generateAsset`
- `video.generateStoryboard`
- `voice.generateAudio`
- `code.generatePatch`
- `cms.createFolderTree`
- `content.createCalendar`
- `content.createItem`
- `content.analyzePerformance`
- `content.optimizeItem`
- `content.queuePublish`
- `content.draftEngagementReply`

## 6. Repo and File Map

Installed in AUTO BUILDER:

- `factory/media-content-generator.json`
- `docs/inventories/nashville-system-inventory.md`
- `docs/build-packets/media-content-operating-system.md`
- `src/lib/execution-worker.ts` extended with `drive.copyFileToFolder`

Next implementation files:

- `src/lib/media-content-os.ts`
- `src/app/api/factory/media-content/route.ts`
- `src/app/api/cron/content-ideas/route.ts`
- `src/app/api/cron/content-analyze/route.ts`
- `src/app/api/cron/content-optimize/route.ts`
- `supabase/migrations/*media_content_os*.sql`
- `apps/control-plane/src/views/media-content/*`

## 7. Tool and Integration Plan

Use these providers by capability:

- OpenAI: copy, strategy, image prompts, agent reasoning, code planning
- image generation tool: raster image creation and variants
- speech generation tool: voiceover and narration files
- HeyGen: avatar video sessions and presenter-led video
- Xyla or Metricool: scheduling/publishing once explicitly approved
- Google Drive: asset source truth and folder/file generation
- GitHub: code, docs, templates, PRs
- Vercel: preview, production, browser-safe runtime
- Supabase: data, roles, RLS, telemetry, queues, receipts
- Playwright: screenshot QA and funnel QA

## 8. Validation Plan

Required gates:

- Drive folder read/write smoke
- Brand asset clone receipt
- Image generation receipt
- Voice generation receipt
- Video storyboard receipt
- Code patch dry-run receipt
- Content calendar generation receipt
- Publish dry-run receipt
- Engagement draft policy test
- Screenshot QA desktop/mobile
- Supabase row persistence test
- RLS and role audit
- Quarantine and rollback test

## 9. Required Docs and Playbooks

- Brand source-truth doc
- Asset ledger
- Content calendar
- Channel policy
- Engagement policy
- AI generation prompt library
- Visual QA checklist
- Approval and quarantine playbook
- Production release playbook
- Analytics and optimization playbook

## 10. Blockers or Missing Pieces

- Current Drive connector in ChatGPT is read-only for this run.
- AUTO BUILDER Vercel deployment has not yet served the latest worker commits.
- Secrets/env surfaces for Drive, Xyla, Metricool, HeyGen, and Supabase need verification in the live project.
- Production publishing must remain approval-gated.

## 11. Next Best Prompt

Run AUTO BUILDER cloud worker for `drive.copyFileToFolder` using source file IDs `1TIxz4t2mu_NFgZvYMLKJ0uZ6WY3N3lp9` and `1OKaxgtblK32U8Ffc16wPKlIDnlW_Eokl`, target folder `1ELQQUs4xGZjPnDYiq0_rWYP9mvt_qtAZ`, then run the Media Content OS validation checklist and generate the first 180-day content calendar for the next project.
