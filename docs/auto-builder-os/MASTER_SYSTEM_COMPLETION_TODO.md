# AUTO BUILDER OS - Master System Completion TODO

Date: 2026-06-07
Status: Mandatory master checklist

## Lock

This is the controlling checklist for AUTO BUILDER OS completion. All agents must work from this file until complete. Do not create unrelated work. Do not redesign. Do not claim completion without receipts.

## 0. Master Control Files

- [ ] `docs/auto-builder-os/START_HERE_MASTER_COMPLETION_LOCK.md`
- [x] `docs/auto-builder-os/LOCKED_FILES_MANIFEST.md` - evidence: installed in PR #19 branch
- [x] `docs/auto-builder-os/AGENT_WORKFLOW_LOCK.md` - evidence: installed in PR #19 branch
- [x] `docs/auto-builder-os/LEAN_SYSTEM_OUTPUT_CONTRACT.md` - evidence: installed in PR #19 branch
- [x] `docs/auto-builder-os/REPEATABLE_AGENT_RUNBOOK.md` - evidence: installed in PR #19 branch
- [x] `docs/auto-builder-os/WORKFLOW_RECEIPT_SCHEMA.json` - evidence: installed in PR #19 branch
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

## 0A. Locked Agent Workflow

- [x] Lock the agent to repo-first operation, not local-first operation.
- [x] Lock every run to exactly one master TODO item unless operator directs otherwise.
- [x] Lock outputs to repo artifact, validation receipt, hard gate, approval request, or release/rollback record.
- [x] Lock invalid outputs: local-only proof, mocks, samples, env-name-only checks, unrun tests, and unapproved live mutations.
- [x] Lock receipt shape for repeatable runs.

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