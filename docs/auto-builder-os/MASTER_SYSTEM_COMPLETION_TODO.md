# AUTO BUILDER OS - Master System Completion TODO

Date: 2026-06-07
Status: Mandatory master checklist

## Lock

This is the controlling checklist for AUTO BUILDER OS completion. All agents must work from this file until complete. Do not create unrelated work. Do not redesign. Do not claim completion without receipts.

## 0. Master Control Files

- [ ] `docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md`
- [ ] `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md`
- [ ] `docs/auto-builder-os/FINAL_DEFINITION_OF_DONE.md`
- [ ] `docs/auto-builder-os/SYSTEM_STATUS_MATRIX.md`
- [ ] `docs/auto-builder-os/BUILD_EVIDENCE_REQUIREMENTS.md`
- [ ] `docs/auto-builder-os/PROTECTED_ACTION_POLICY.md`
- [ ] `docs/auto-builder-os/DRIVE_GIT_SOURCE_TRUTH_POLICY.md`
- [ ] `docs/auto-builder-os/VERCEL_BUILDS_NOT_GPT_POLICY.md`
- [ ] `docs/auto-builder-os/AUTONOMOUS_BRIDGE_REQUIREMENTS.md`
- [ ] `docs/auto-builder-os/FRONTEND_BACKEND_SYNC_REQUIREMENTS.md`
- [ ] `docs/auto-builder-os/AUTO_SOCIAL_COMPLETION_REQUIREMENTS.md`

## 1. Repo, Branch, PR

- [ ] Keep PR #18 as bridge-clearance lane.
- [ ] Keep PR #19 as uploaded-frontend audit lane.
- [ ] Create implementation branch `auto-builder/frontend-system-port-20260607`.
- [ ] Add this master TODO to the implementation branch.
- [ ] Add generator packet to the implementation branch.
- [ ] Add Vercel Workflow packet to the implementation branch.
- [ ] Add Vercel Sandbox and five-minute cron packet.
- [ ] Do not merge implementation until install/lint/typecheck/build pass.
- [ ] Do not merge implementation until Supabase dev schema passes.
- [ ] Do not merge implementation until route smoke passes.
- [ ] Do not merge implementation until browser smoke passes.
- [ ] Do not merge implementation until connector dry-runs pass or hard-gate.
- [ ] Add PR evidence comments after smoke runs.
- [ ] Add rollback instructions before merge.
- [ ] Add release-hold checklist before production deploy.

## 2. Root Project Files

- [ ] `package.json`
- [ ] `pnpm-lock.yaml` or selected lockfile
- [ ] `next.config.js`
- [ ] `tsconfig.json`
- [ ] `tailwind.config.*`
- [ ] `postcss.config.mjs`
- [ ] `components.json`
- [ ] `.env.example`
- [ ] `.env.preview.example`
- [ ] `.env.production.example`
- [ ] `README.md`
- [ ] `AGENTS.md`

Actions:

- [ ] Reconcile dependencies.
- [ ] Confirm Next.js compatibility.
- [ ] Confirm React compatibility.
- [ ] Confirm Tailwind compatibility.
- [ ] Confirm shadcn config.
- [ ] Confirm import aliases.
- [ ] Add full env-name contract.
- [ ] Add master lock reference to README and AGENTS.

## 3. Frontend App Routes

- [ ] `app/page.tsx`
- [ ] `app/layout.tsx`
- [ ] `app/globals.css`
- [ ] `app/manifest.ts`
- [ ] `app/agent/page.tsx`
- [ ] `app/agent-bridge/page.tsx`
- [ ] `app/analytics/page.tsx`
- [ ] `app/audit/page.tsx`
- [ ] `app/bridge/page.tsx`
- [ ] `app/bridge-admin/page.tsx`
- [ ] `app/bridges/page.tsx`
- [ ] `app/projects/page.tsx`
- [ ] `app/recursive-builder/page.tsx`
- [ ] `app/security/page.tsx`
- [ ] `app/system-health/page.tsx`
- [ ] `app/workflow/page.tsx`
- [ ] `app/nashville-resin-worx/page.tsx`

Actions:

- [ ] Replace sample UI states with live backend data or honest empty states.
- [ ] Add loading states.
- [ ] Add error states.
- [ ] Add disabled states for gated actions.
- [ ] Verify no secret values render.
- [ ] Verify mobile layout.
- [ ] Verify desktop layout.
- [ ] Verify no text overlap.

## 4. Frontend Components

- [ ] `components/agent-bridge.tsx`
- [ ] `components/agent-control-panel.tsx`
- [ ] `components/bridge-command-center.tsx`
- [ ] `components/bridge-verification-ui.tsx`
- [ ] `components/bridge/autonomous-bridge.tsx`
- [ ] `components/analytics/analytics-dashboard.tsx`
- [ ] `components/dashboard/user-dashboard.tsx`
- [ ] `components/projects/projects-shell.tsx`
- [ ] `components/projects/projects-view.tsx`
- [ ] `components/workflow/workflow-control-page.tsx`
- [ ] `components/workflow-builder.tsx`
- [ ] `components/system-health-dashboard.tsx`
- [ ] `components/system-audit-dashboard.tsx`
- [ ] `components/security-dashboard.tsx`
- [ ] `components/supabase-bridge-panel.tsx`
- [ ] `components/pre-configuration-builder.tsx`
- [ ] `components/recursive-auto-builder-ui.tsx`
- [ ] `components/live-activation-status.tsx`
- [ ] `components/library-browser.tsx`
- [ ] `components/service-worker.tsx`

## 5. Workspace And Studio Components

- [ ] `components/workspace/workspace-shell.tsx`
- [ ] `components/workspace/workspace-context.tsx`
- [ ] `components/workspace/chat-panel.tsx`
- [ ] `components/workspace/editor-panel.tsx`
- [ ] `components/workspace/mobile-mode-bar.tsx`
- [ ] `components/workspace/resizable-sidebar.tsx`
- [ ] `components/workspace/tool-rail.tsx`
- [ ] `components/workspace/toolbar-position-switcher.tsx`
- [ ] `components/workspace/studios/avatar-studio.tsx`
- [ ] `components/workspace/studios/blueprint-studio.tsx`
- [ ] `components/workspace/studios/browser-studio.tsx`
- [ ] `components/workspace/studios/code-studio.tsx`
- [ ] `components/workspace/studios/image-studio.tsx`
- [ ] `components/workspace/studios/sandbox-studio.tsx`
- [ ] `components/workspace/studios/video-studio.tsx`

## 6. Enhancement Components

- [ ] `components/enhancements/autonomy-slider.tsx`
- [ ] `components/enhancements/design-canvas.tsx`
- [ ] `components/enhancements/design-system-manager.tsx`
- [ ] `components/enhancements/real-time-preview.tsx`
- [ ] `components/enhancements/task-queue.tsx`

## 7. Engine API Routes

- [ ] `app/api/engines/catalog/route.ts`
- [ ] `app/api/engines/status/route.ts`
- [ ] `app/api/engines/run/route.ts`
- [ ] `app/api/engines/batch/route.ts`
- [ ] `app/api/engines/results/[projectId]/route.ts`

Actions:

- [ ] Add request validation.
- [ ] Add receipt IDs.
- [ ] Add Supabase persistence.
- [ ] Add error recovery.
- [ ] Add rate limits.
- [ ] Add approval-gate checks.
- [ ] Smoke every route.

## 8. Engine Code

- [ ] `lib/engines/index.ts`
- [ ] `lib/engines/registry.ts`
- [ ] `lib/engines/types.ts`
- [ ] `lib/engines/intelligence/intelligence-engine.ts`
- [ ] `lib/engines/benchmark/benchmark-engine.ts`
- [ ] `lib/engines/wealth/wealth-engine.ts`
- [ ] `lib/engines/agents/agent-factory.ts`
- [ ] `lib/engines/memory/memory-store.ts`
- [ ] `lib/engines/learning/learning-engine.ts`
- [ ] `lib/engines/metabuilder/metabuilder-engine.ts`
- [ ] `lib/engines/governance/governance-engine.ts`
- [ ] `lib/engines/scoring/quality-score-engine.ts`
- [ ] `lib/engines/improvement/auto-improvement-engine.ts`

Actions:

- [ ] Replace static benchmark defaults with live source-backed search.
- [ ] Add top-three global benchmark discovery.
- [ ] Add benchmark scoring rubric.
- [ ] Add benchmark source links.
- [ ] Add reusable pattern extraction.
- [ ] Enforce no copying protected assets/code.
- [ ] Add business-model scoring.
- [ ] Add revenue forecast.
- [ ] Add CAC/LTV/payback model.
- [ ] Add cash-flow runway.
- [ ] Add base/bull/bear simulations.
- [ ] Add quality score thresholds.
- [ ] Add launch-readiness score.
- [ ] Add improvement recommendations.
- [ ] Store every result to Supabase.
- [ ] Emit receipt for every engine run.

## 9. Project System

- [ ] `app/api/projects/route.ts`
- [ ] `lib/database/project-repository.ts`

Actions:

- [ ] Create project.
- [ ] List projects.
- [ ] Get project.
- [ ] Update project phase.
- [ ] Store idea.
- [ ] Store discovery.
- [ ] Store benchmark.
- [ ] Store brand pack.
- [ ] Store selected option.
- [ ] Store build packet.
- [ ] Store approval state.
- [ ] Store receipts.

## 10. Workflow System

- [ ] `app/api/workflows/route.ts`
- [ ] `app/api/workflows/[runId]/route.ts`
- [ ] `app/api/workflow/execute/route.ts`
- [ ] `lib/enhanced-workflow-executor.ts`
- [ ] `lib/agent-workflow.ts`
- [ ] `lib/workflow-parameters.ts`

Phases:

- [ ] PLAN
- [ ] DISCOVERY
- [ ] BENCHMARK
- [ ] BRAND
- [ ] APPROVAL
- [ ] DOCS
- [ ] BUILD PACKET
- [ ] VERCEL WORKFLOW
- [ ] SANDBOX
- [ ] VALIDATE
- [ ] RELEASE HOLD
- [ ] OPERATE
- [ ] OPTIMIZE

## 11. Approval And Gates

- [ ] `app/api/gates/create/route.ts`
- [ ] `app/api/gates/respond/route.ts`
- [ ] `app/api/approvals/route.ts`
- [ ] `app/api/approvals/[requestId]/route.ts`
- [ ] `lib/approvals/gate.ts`

Actions:

- [ ] Create approval request.
- [ ] Respond approve.
- [ ] Respond reject.
- [ ] Expire stale approvals.
- [ ] Record approval receipt.
- [ ] Send push notification.
- [ ] Send Google Chat notification.
- [ ] Add rollback instructions.

## 12. Protected Actions

- [ ] Block production deploy without approval.
- [ ] Block production DB migration without approval.
- [ ] Block secret change without approval.
- [ ] Block Shopify mutation without approval.
- [ ] Block Stripe/payment mutation without approval.
- [ ] Block live social publishing without approval.
- [ ] Block customer messages without approval.
- [ ] Block email sending without approval.
- [ ] Block database deletion without approval.
- [ ] Block external spend without approval.
- [ ] Block credentialed browser action without approval.
- [ ] Block destructive file action without approval.

## 13. Bridge API Routes

- [ ] `app/api/bridge/policy-check/route.ts`
- [ ] `app/api/bridge/preflight/route.ts`
- [ ] `app/api/bridge/approval-request/route.ts`
- [ ] `app/api/bridge/command/route.ts`
- [ ] `app/api/bridge/direct-execution/route.ts`
- [ ] `app/api/bridge/zero-inference/route.ts`
- [ ] `app/api/bridge/github-actions-dispatch/route.ts`
- [ ] `app/api/bridge/supabase-switch/route.ts`
- [ ] `app/api/bridge/v0-current-work/route.ts`
- [ ] `app/api/bridge/build-validation/route.ts`
- [ ] `app/api/bridge/registry/route.ts`
- [ ] `app/api/bridge/connectors/status/route.ts`
- [ ] `app/api/bridge/connectors/dry-run/route.ts`
- [ ] `app/api/bridge/connectors/execute-approved/route.ts`
- [ ] `app/api/bridge/unblock/scan/route.ts`

## 14. Bridge Library Code

- [ ] `lib/autonomous-bridge-registry.ts`
- [ ] `lib/bridge/github-actions-dispatch.ts`
- [ ] `lib/bridge/supabase-compatibility-bridge.ts`
- [ ] `lib/bridge/connector-bridge-contract.ts`
- [ ] `lib/bridges/registry.ts`
- [ ] `lib/bridges/governance.ts`

Actions:

- [ ] Add HMAC validation.
- [ ] Add bearer validation.
- [ ] Add env-name-only status.
- [ ] Add hard-gate receipts.
- [ ] Add dry-run mode.
- [ ] Add execute-approved mode.
- [ ] Add connector widening state.
- [ ] Add audit receipt storage.

## 15. Connector Bridges

- [ ] GitHub bridge.
- [ ] Vercel bridge.
- [ ] Supabase bridge.
- [ ] Google Drive read bridge.
- [ ] Google Drive write bridge.
- [ ] Google Chat bridge.
- [ ] n8n bridge.
- [ ] Playwright runner bridge.
- [ ] Local device relay bridge.
- [ ] AI Gateway bridge.
- [ ] OpenAI bridge.
- [ ] Shopify bridge.
- [ ] Stripe bridge.
- [ ] HeyGen bridge.
- [ ] Higgsfield bridge.
- [ ] Metricool bridge.
- [ ] Xyla bridge.
- [ ] Gmail bridge.
- [ ] Google Calendar bridge.
- [ ] Audit receipts bridge.

## 16. Supabase Files

- [ ] `db/2026-06-07_autobuilder_completion_schema.sql`
- [ ] `lib/db/schema.sql`
- [ ] `lib/supabase.ts`
- [ ] `lib/supabase/client.ts`
- [ ] `lib/init-supabase-bridge.ts`
- [ ] `lib/supabase-credential-vault.ts`
- [ ] `lib/database/project-repository.ts`
- [ ] `lib/database/engine-run-repository.ts`

## 17. Supabase Tables

- [ ] `company_projects`
- [ ] `engine_runs`
- [ ] `workflow_runs`
- [ ] `audit_receipts`
- [ ] `audit_trails`
- [ ] `project_memory`
- [ ] `memory_relationships`
- [ ] `governance_actions`
- [ ] `quality_assessments`
- [ ] `template_library`
- [ ] `analytics_events`
- [ ] `generated_artifacts`
- [ ] `task_trees`
- [ ] `task_state`
- [ ] `receipts`
- [ ] `bridge_events`
- [ ] `bridge_connections`
- [ ] `bridge_credentials`
- [ ] `connector_receipts`
- [ ] `approval_queue`
- [ ] `browser_screenshots`
- [ ] `auto_social_campaigns`
- [ ] `auto_social_posts`
- [ ] `auto_social_media_assets`
- [ ] `auto_social_schedules`
- [ ] `auto_social_approvals`

## 18. Supabase Actions

- [ ] Create dev branch.
- [ ] Apply schema to dev branch only.
- [ ] Add RLS policies.
- [ ] Add tenant isolation.
- [ ] Add service-role-only write paths.
- [ ] Add indexes.
- [ ] Add updated-at triggers.
- [ ] Add audit triggers.
- [ ] Add Vault or encryption strategy.
- [ ] Run Supabase advisors.
- [ ] Fix RLS warnings.
- [ ] Fix function search-path warnings.
- [ ] Generate schema receipt.
- [ ] Block production migration until approved.

## 19. Vercel

- [ ] Confirm Vercel project.
- [ ] Confirm `autobuilderos.com` domain.
- [ ] Confirm preview URL.
- [ ] Configure Preview env names.
- [ ] Configure Production env names only after approval.
- [ ] Add Vercel Workflow implementation.
- [ ] Add Vercel Cron implementation.
- [ ] Add five-minute cron route.
- [ ] Add Vercel Sandbox route.
- [ ] Add Vercel Agent manifests.
- [ ] Add AI Gateway routing.
- [ ] Add deployment receipt.
- [ ] Add preview smoke.
- [ ] Add production release hold.

## 20. Env Names

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `AI_GATEWAY_API_KEY`
- [ ] `GITHUB_ACTIONS_DISPATCH_TOKEN`
- [ ] `AUTO_BUILDER_GITHUB_REPOSITORY`
- [ ] `AUTO_BUILDER_BUILD_WORKFLOW_ID`
- [ ] `AUTO_BUILDER_BUILD_REF`
- [ ] `GOOGLE_CHAT_WEBHOOK_URL`
- [ ] `N8N_API_KEY`
- [ ] `N8N_BASE_URL`
- [ ] `N8N_WEBHOOK_SECRET`
- [ ] `HEYGEN_API_KEY`
- [ ] `HIGGSFIELD_API_KEY`
- [ ] `HIGGINGFIELD_API_KEY`
- [ ] `METRICOOL_API_KEY`
- [ ] `METRICOOL_BRAND_ID`
- [ ] `METRICOOL_PROFILE_ALLOWLIST`
- [ ] `SHOPIFY_API_KEY`
- [ ] `SHOPIFY_API_SECRET`
- [ ] `XYLA_API_KEY`
- [ ] `BRIDGE_SECRET`

## 21. GitHub Actions

- [ ] `.github/workflows/autobuilder-build-bridge.yml`
- [ ] `.github/workflows/recursive-bridge-clearance-smoke.yml`
- [ ] `.github/workflows/frontend-preview-smoke.yml`
- [ ] `.github/workflows/supabase-dev-schema-smoke.yml`
- [ ] `.github/workflows/auto-social-draft-smoke.yml`
- [ ] `.github/workflows/browser-screenshot-smoke.yml`

Jobs:

- [ ] Install.
- [ ] Lint.
- [ ] Typecheck.
- [ ] Build.
- [ ] API smoke.
- [ ] Browser smoke.
- [ ] Connector dry-run.
- [ ] Receipt artifact upload.
- [ ] Screenshot artifact upload.
- [ ] PR evidence comment.

## 22. Browser And Playwright

- [ ] `app/api/browser/status/route.ts`
- [ ] `app/api/browser/evidence/route.ts`
- [ ] `lib/browser/evidence.ts`
- [ ] Playwright config.
- [ ] Desktop screenshot test.
- [ ] Mobile screenshot test.
- [ ] Console error capture.
- [ ] DOM overlap check.
- [ ] Navigation smoke.
- [ ] Form smoke.
- [ ] Approval smoke.
- [ ] Bridge page smoke.
- [ ] Workflow page smoke.
- [ ] Project page smoke.
- [ ] Agent page smoke.
- [ ] No secret display smoke.

## 23. Auto Social Docs

- [ ] `docs/auto-social/AUTO_SOCIAL_SYSTEM_SPEC.md`
- [ ] `docs/auto-social/AUTO_SOCIAL_CONNECTOR_CONTRACT.md`
- [ ] `docs/auto-social/AUTO_SOCIAL_APPROVAL_POLICY.md`
- [ ] `docs/auto-social/AUTO_SOCIAL_METRICOOL_PACKET.md`
- [ ] `docs/auto-social/AUTO_SOCIAL_HEYGEN_PACKET.md`
- [ ] `docs/auto-social/AUTO_SOCIAL_HIGGSFIELD_PACKET.md`
- [ ] `docs/auto-social/AUTO_SOCIAL_XYLA_PACKET.md`

## 24. Auto Social API And Code

- [ ] `app/api/auto-social/campaigns/route.ts`
- [ ] `app/api/auto-social/content-plan/route.ts`
- [ ] `app/api/auto-social/posts/route.ts`
- [ ] `app/api/auto-social/media/route.ts`
- [ ] `app/api/auto-social/schedule/route.ts`
- [ ] `app/api/auto-social/approvals/route.ts`
- [ ] `app/api/auto-social/metricool/dry-run/route.ts`
- [ ] `app/api/auto-social/heygen/dry-run/route.ts`
- [ ] `app/api/auto-social/higgsfield/dry-run/route.ts`
- [ ] `components/auto-social/*`
- [ ] `lib/auto-social/content-planner.ts`
- [ ] `lib/auto-social/calendar-generator.ts`
- [ ] `lib/auto-social/hashtag-engine.ts`
- [ ] `lib/auto-social/media-prompt-engine.ts`
- [ ] `lib/auto-social/video-script-engine.ts`
- [ ] `lib/auto-social/metricool-queue.ts`
- [ ] `lib/auto-social/approval-gates.ts`
- [ ] `lib/auto-social/optimization-loop.ts`

## 25. Auto Social Actions

- [ ] Discovery content research.
- [ ] Audience analysis.
- [ ] Competitor social benchmark.
- [ ] Content pillars.
- [ ] Brand voice.
- [ ] 30-day content calendar.
- [ ] Three-posts-per-day schedule where appropriate.
- [ ] Hooks.
- [ ] Captions.
- [ ] Hashtags.
- [ ] Keywords.
- [ ] Image prompts.
- [ ] Video scripts.
- [ ] HeyGen video draft queue.
- [ ] Higgsfield media draft queue.
- [ ] Metricool draft queue.
- [ ] Approval before publish.
- [ ] Daily optimization loop.
- [ ] Weekly optimization loop.
- [ ] Monthly growth review.
- [ ] Analytics receipt.
- [ ] No live posting without approval.

## 26. Drive

- [ ] Build Drive write bridge.
- [ ] Mirror PR #19 audit to Drive.
- [ ] Create `AUTO BUILDER OS - Uploaded Frontend Completion Audit And Final Handoff - 2026-06-07`.
- [ ] Create `AUTO BUILDER OS - Master System Completion TODO`.
- [ ] Create `AUTO BUILDER OS - Frontend Port Packet`.
- [ ] Create `AUTO BUILDER OS - Supabase Dev Schema Packet`.
- [ ] Create `AUTO BUILDER OS - Vercel Workflow Packet`.
- [ ] Create `AUTO BUILDER OS - Auto Social Draft System Packet`.
- [ ] Create `AUTO BUILDER OS - Connector Dry Run Packet`.
- [ ] Create `AUTO BUILDER OS - Final Validation Evidence Log`.
- [ ] Add GitHub PR links to Drive docs.
- [ ] Add Drive doc links to GitHub docs.
- [ ] Require Drive search for every new idea.
- [ ] Require Git search for every new idea.

## 27. Google Chat

- [ ] `app/api/connectors/google-chat/status/route.ts`
- [ ] `app/api/connectors/google-chat/dry-run/route.ts`
- [ ] `app/api/connectors/google-chat/send-approved/route.ts`
- [ ] Add webhook env.
- [ ] Add message templates.
- [ ] Add approval prompts.
- [ ] Add blocked-action alerts.
- [ ] Add receipt messages.
- [ ] Add failure messages.
- [ ] No customer messaging through Google Chat.

## 28. n8n

- [ ] `docs/integrations/N8N_BRIDGE_PACKET.md`
- [ ] `app/api/connectors/n8n/status/route.ts`
- [ ] `app/api/connectors/n8n/dry-run/route.ts`
- [ ] `app/api/connectors/n8n/execute-approved/route.ts`
- [ ] Add harmless echo workflow.
- [ ] Add HMAC verification.
- [ ] Add webhook secret.
- [ ] Add build trigger workflow.
- [ ] Add Auto Social draft workflow.
- [ ] Add retry workflow.
- [ ] Add receipt workflow.

## 29. AI Gateway

- [ ] `docs/ai/AI_GATEWAY_POLICY.md`
- [ ] `lib/ai/model-router.ts`
- [ ] `lib/ai/cost-policy.ts`
- [ ] `lib/ai/provider-fallback.ts`
- [ ] `lib/ai/prompt-templates.ts`
- [ ] Cheapest acceptable model default.
- [ ] Escalation rules.
- [ ] Cost receipt.
- [ ] Model receipt.
- [ ] Prompt version receipt.
- [ ] Output quality score.

## 30. Agent Factory

- [ ] CEO Agent.
- [ ] Planner Agent.
- [ ] Research Agent.
- [ ] Benchmark Agent.
- [ ] Wealth Agent.
- [ ] Brand Agent.
- [ ] Website Agent.
- [ ] Workflow Agent.
- [ ] Developer Agent.
- [ ] QA Agent.
- [ ] Security Agent.
- [ ] Social Agent.
- [ ] Content Agent.
- [ ] Video Agent.
- [ ] Store Agent.
- [ ] Analytics Agent.
- [ ] Governance Agent.
- [ ] Recovery Agent.
- [ ] MetaBuilder Agent.

Each agent needs:

- [ ] Mission.
- [ ] Inputs.
- [ ] Outputs.
- [ ] Tools.
- [ ] Permissions.
- [ ] Approval gates.
- [ ] Receipts.
- [ ] Failure behavior.
- [ ] KPIs.
- [ ] Memory scope.

## 31. Wealth And Finance

- [ ] `docs/finance/WEALTH_ENGINE_SPEC.md`
- [ ] `docs/finance/FINANCIAL_SIMULATION_PACKET.md`
- [ ] Startup cost.
- [ ] Pricing model.
- [ ] Offer ladder.
- [ ] Revenue forecast.
- [ ] Margin model.
- [ ] Break-even.
- [ ] CAC.
- [ ] LTV.
- [ ] Payback period.
- [ ] Cash-flow runway.
- [ ] Base case.
- [ ] Bull case.
- [ ] Bear case.
- [ ] Sensitivity table.
- [ ] Risk controls.
- [ ] Scale plan.
- [ ] No guaranteed income claims.

## 32. Benchmark Intelligence

- [ ] `docs/benchmark/BENCHMARK_INTELLIGENCE_SPEC.md`
- [ ] `docs/benchmark/REVERSE_ENGINEERING_POLICY.md`
- [ ] Search public sources.
- [ ] Identify top-three benchmarks.
- [ ] Score each benchmark.
- [ ] Extract reusable patterns.
- [ ] Identify weak areas.
- [ ] Generate improved original strategy.
- [ ] Generate three brand options.
- [ ] Generate three website options.
- [ ] Generate three workflow options.
- [ ] Stop for approval.

## 33. Security And Audit

- [ ] `app/api/security/audit-trails/route.ts`
- [ ] `app/api/security/receipts/route.ts`
- [ ] `app/api/security/red-team/route.ts`
- [ ] `lib/security/audit.ts`
- [ ] `lib/security/red-team.ts`
- [ ] Audit every action.
- [ ] Redact secrets.
- [ ] Add rate limits.
- [ ] Add auth/session.
- [ ] Add role-based access.
- [ ] Add tenant isolation.
- [ ] Add rollback plan.
- [ ] Add incident log.

## 34. Auth And Account Vault

- [ ] `app/api/accounts/route.ts`
- [ ] `lib/account-connector.ts`
- [ ] `lib/supabase-credential-vault.ts`
- [ ] User login.
- [ ] User account vault.
- [ ] Connector readiness.
- [ ] Secret names only.
- [ ] OAuth where needed.
- [ ] API key status.
- [ ] Account readiness checklist.
- [ ] Credential rotation.
- [ ] Connector allowlists.

## 35. Shopify

- [ ] `docs/commerce/SHOPIFY_STORE_BUILD_PACKET.md`
- [ ] Shopify read-only dry-run.
- [ ] Product draft creation gate.
- [ ] Store setup gate.
- [ ] Product description generator.
- [ ] Collection generator.
- [ ] Store policy generator.
- [ ] No live Shopify mutation without approval.

## 36. Stripe

- [ ] `docs/payments/STRIPE_BILLING_POLICY.md`
- [ ] Stripe readiness check.
- [ ] Pricing plans.
- [ ] Checkout flow.
- [ ] Subscription flow.
- [ ] Usage billing if needed.
- [ ] Payment approval gate.
- [ ] No charge/refund/payment mutation without approval.

## 37. Evidence Folders

- [ ] `docs/auto-builder-os/evidence/`
- [ ] `docs/auto-builder-os/evidence/build-receipts/`
- [ ] `docs/auto-builder-os/evidence/browser-screenshots/`
- [ ] `docs/auto-builder-os/evidence/connector-dry-runs/`
- [ ] `docs/auto-builder-os/evidence/supabase-advisors/`
- [ ] `docs/auto-builder-os/evidence/route-smoke/`

## 38. Required Receipts

- [ ] Install receipt.
- [ ] Lint receipt.
- [ ] Typecheck receipt.
- [ ] Build receipt.
- [ ] Route smoke receipt.
- [ ] Browser screenshot receipt.
- [ ] Supabase schema receipt.
- [ ] Supabase advisor receipt.
- [ ] Bridge policy receipt.
- [ ] GitHub dispatch receipt.
- [ ] Google Chat receipt.
- [ ] n8n receipt.
- [ ] Metricool receipt.
- [ ] HeyGen receipt.
- [ ] Higgsfield receipt.
- [ ] Shopify receipt.
- [ ] Auto Social draft receipt.
- [ ] Approval gate receipt.
- [ ] Blocked-action receipt.
- [ ] Release hold receipt.
