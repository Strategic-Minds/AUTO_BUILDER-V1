# AUTO BUILDER Generator Repo Analysis And Feature TODO

## Purpose

This document reverse-engineers the AUTO BUILDER OS target from the current repo, the submitted AWOS docs, the v0 frontend branch, bridge PRs, and uploaded local bridge evidence. It is the master feature TODO for moving from bridge installation to an autonomous generator factory.

## Source Truth Inspected

- `Strategic-Minds/AUTO_BUILDER` repo metadata and PR #13 file list.
- `Strategic-Minds/v0-auto-builder-v2` repo metadata and PR #1 file list.
- `docs/awos-max-autonomy/*` in the AUTO BUILDER branch.
- `src/lib/autobuilder.ts`, `src/lib/awos-handoff.ts`, `workflows/awos-recursive-control.ts`, `vercel.json`, and bridge routes in AUTO BUILDER.
- `app/bridges/page.tsx`, `components/bridge-command-center.tsx`, and `lib/autonomous-bridge-registry.ts` in v0.
- Workspace builder docs under `agent_files/builder-docs/`.
- AWOS operating files under `agent_files/awos/`.
- Uploaded local bridge evidence in `user_files/02-Pasted-text-2-.txt`, `03-Pasted-text-3-.txt`, and `04-Pasted-text-4-.txt`.

## What Done Means

AUTO BUILDER is done when the system can accept a high-level build request, rehydrate source truth, generate a scoped build packet, create sandbox work, validate it, surface it in v0, collect receipts, and hand off approval-gated live changes without the operator copy/pasting instructions between tools.

Done does not mean unrestricted production mutation. Production deploys, database writes, secret changes, billing, live publishing, Google Chat outbound messages, commerce changes, and credentialed browser actions remain approval-gated.

## Verified Done

- AUTO BUILDER repo exists and is available with admin/push permissions.
- v0 frontend repo exists and is available with admin/push permissions.
- Bridge PR #13 installs registry, env-name, command, repo-visibility, Supabase admin, smoke, policy-check, Playwright screenshot script, local relay scaffold, and GitHub Actions smoke workflow.
- v0 PR #1 installs `/bridges` command center and points to the verified AUTO BUILDER command preview.
- Google Chat is the selected operator channel; Slack is removed from the active default path.
- Stripe is deferred until payday/finance phase; Shopify Payments remains primary for the current commerce phase.
- Vercel cron already includes a 5-minute `/api/cron/recursive-control` route.
- Vercel Workflow package and Vercel Sandbox package are already present in AUTO BUILDER dependencies.
- `workflows/awos-recursive-control.ts` already materializes queue jobs, agent plans, telemetry, sandbox validation, and approval holds.
- `src/lib/awos-handoff.ts` already points to canonical AWOS docs and queue materialization.
- Browser worker infrastructure exists through `/api/browser/process` and Playwright dependencies.
- Supabase telemetry helpers exist and support dry-run behavior when env is missing.
- Local uploaded evidence shows a separate phone/device/local relay hardening track exists, but that track is not fully installed into the current sandbox PR.

## Done But Needs Smoke Evidence

- Command route GET is verified; POST smoke still needs a POST-capable runner.
- Browser screenshot workflow exists; screenshot artifacts still need to be generated.
- Supabase admin route exists; live writes are intentionally disabled.
- v0 reads bridge/action surfaces; persistent command writes are gated.
- GitHub smoke workflow exists; it needs execution evidence and artifact review.

## Missing Generator Layer

The repo has bridge and recursive-control foundations, but the explicit generator factory needs to be installed as a first-class subsystem.

Required generator features:

1. Intake generator: convert user requests into structured build intents.
2. Source-truth rehydrator: pull AWOS docs, builder docs, repo state, v0 state, memory state, and bridge state.
3. Done-state resolver: define what finished means before build starts.
4. Reverse-engineering worker: compare target outcome against current repo and generate delta tasks.
5. Feature matrix generator: produce every possible feature lane and classify current state.
6. Build packet generator: emit implementation-ready packets for app, workflow, agent, frontend, backend, validation, and release.
7. Sandbox task generator: create Vercel Sandbox-safe tasks with no live mutation.
8. AI Gateway agent prompt generator: prepare model prompts and tool instructions without exposing secrets.
9. Vercel Workflow runner: execute bounded generator cycles durably.
10. Five-minute cron trigger: keep generator inspection and next-task creation alive.
11. v0 command center sync: expose generator status, docs, routes, and approval gates in frontend.
12. Queue and receipt persistence: write queue jobs and receipts when Supabase env is enabled.
13. Browser QA generation: create screenshot tasks and evidence requirements.
14. GitHub Actions dispatch: allow manual and scheduled smoke on branch/previews.
15. Google Chat operator draft bridge: draft status and approval messages without sending until approved.
16. Release handoff generator: produce merge, validation, rollback, and post-release checks.

## Full Feature TODO

### Control Plane

- [x] Repo bridge registry.
- [x] Command route scaffold.
- [x] Repo visibility route.
- [x] Policy-check route.
- [ ] Generator factory route.
- [ ] Generator queue status route.
- [ ] Generator receipt route.
- [ ] Approval queue UI.
- [ ] Operator daily status route.
- [ ] Recovery dashboard route.

### Generator OS

- [ ] Request intake normalizer.
- [ ] Done-state contract generator.
- [ ] Source-truth map resolver.
- [ ] Reverse-engineered delta planner.
- [ ] Feature inventory and TODO generator.
- [ ] Build packet generator.
- [ ] Sandbox packet generator.
- [ ] Frontend alignment packet generator.
- [ ] Vercel workflow packet generator.
- [ ] Release handoff generator.
- [ ] Monetization packet generator.
- [ ] Distribution packet generator.
- [ ] Replication packet generator.

### Vercel Workflow

- [x] `workflow` dependency installed.
- [x] Recursive workflow file exists.
- [x] 5-minute recursive-control cron exists.
- [ ] Dedicated generator workflow route.
- [ ] Dedicated generator workflow smoke.
- [ ] Workflow run receipt dashboard.
- [ ] Workflow artifact schema.
- [ ] Workflow failure retry policy.
- [ ] Workflow replay/idempotency check.

### Vercel Sandbox

- [x] `@vercel/sandbox` dependency installed.
- [x] Recursive workflow can run sandbox-tagged tasks.
- [ ] Generator sandbox task templates.
- [ ] Build artifact validator inside sandbox.
- [ ] Sandbox preview evidence pack.
- [ ] Sandbox-to-PR handoff rule.
- [ ] Sandbox failure recovery recipe.

### AI Gateway And Agents

- [x] AI Gateway env name exists in bridge env contract.
- [ ] AI Gateway model routing contract.
- [ ] Cost and budget guardrails per generator run.
- [ ] Agent prompt registry.
- [ ] Tool access matrix per agent.
- [ ] Agent output schemas.
- [ ] Agent retry and escalation rules.
- [ ] Agent memory compression rules.

### Browser And QA

- [x] Playwright dependency installed.
- [x] Browser process route exists.
- [x] Screenshot script exists.
- [ ] Browser screenshot smoke artifact review.
- [ ] Console error capture acceptance rule.
- [ ] Mobile/desktop screenshot gating.
- [ ] v0 command center screenshot smoke.
- [ ] Generator route smoke.

### Supabase And Telemetry

- [x] Telemetry helper exists.
- [x] Supabase admin route exists.
- [x] Allowlist model exists.
- [ ] Generator queue table schema confirmation.
- [ ] Generator receipt table schema confirmation.
- [ ] RLS policy plan for frontend-safe reads.
- [ ] Migration approval packet.
- [ ] Telemetry dashboard mapping.

### Frontend And v0

- [x] v0 bridge command center exists.
- [x] v0 action surfaces point at command-enabled AUTO BUILDER preview.
- [ ] Generator status panel.
- [ ] Queue status panel.
- [ ] Approval queue panel.
- [ ] Build packet viewer.
- [ ] Smoke evidence viewer.
- [ ] Google Chat operator draft viewer.
- [ ] Phone-first command layout.

### GitHub And Release

- [x] PR #13 exists for AUTO BUILDER bridge suite.
- [x] PR #1 exists for v0 bridge command center.
- [x] Bridge smoke workflow exists.
- [ ] Generator workflow smoke workflow.
- [ ] Merge-readiness checklist linked in PR.
- [ ] Release handoff doc.
- [ ] Rollback doc for generator subsystem.
- [ ] Post-merge production verification checklist.

### Google Chat

- [x] Google Chat selected in docs and env-name route.
- [ ] Google Chat webhook env configured through approved channel.
- [ ] Draft-only message route.
- [ ] Approved test-message smoke.
- [ ] Recurring status notification schedule.

### Commerce And Payments

- [x] Shopify Payments selected as current payment surface.
- [x] Stripe deferred.
- [ ] Shopify product/offer draft generator.
- [ ] Checkout/offer readiness validator.
- [ ] Stripe reactivation packet for payday phase.
- [ ] Billing mutation approval policy surfaced in frontend.

### Local Device And Phone Bridge

- [x] Local uploaded evidence shows phone/device bridge work exists locally.
- [ ] Reconcile local device bridge files into repo branch.
- [ ] Device bridge docs merge.
- [ ] Phone-to-computer local relay smoke.
- [ ] Local mutation approval workflow.

## Reverse-Engineered Build Order

1. Install generator docs and route contract.
2. Add 5-minute generator cron alongside recursive control.
3. Add GitHub Actions generator smoke workflow.
4. Add v0 generator action surface.
5. Run GET smoke on generator route.
6. Run POST/browser smoke from GitHub Actions.
7. Add generator queue persistence only after Supabase allowlists are approved.
8. Add frontend panels for generator queue, receipts, and approvals.
9. Reconcile local device bridge track into a clean repo branch.
10. Merge AUTO BUILDER first, then v0 after evidence is clean.

## Next Best Prompt For Workflow

Run the generator workflow smoke against the AUTO BUILDER preview, collect the route JSON and browser screenshots, then create the next implementation PR that adds generator queue persistence and frontend generator panels while keeping production mutation gated.
