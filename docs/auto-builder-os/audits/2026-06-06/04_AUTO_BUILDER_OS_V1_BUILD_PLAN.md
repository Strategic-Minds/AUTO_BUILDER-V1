# AUTO BUILDER OS v1.0 Build Plan

## Definition Of Done

AUTO BUILDER OS v1.0 is done when the system can intake a business/build request, generate a governed build packet, execute in sandbox/preview, record proof in Supabase, show status in the v0 frontend, request approval through Google Chat or in-app approvals, and stop before protected production mutations unless explicitly approved.

## Phase 0: Freeze And Reconcile Source Truth

- Treat current `main` plus the two OS docs as source truth.
- Rebuild or rebase PR #13 from current main.
- Reconcile v0 PR #1 with the newest AUTO BUILDER OS frontend branch.
- Remove Slack assumptions from docs, readiness maps, and UI; replace with Google Chat.

Exit criteria: clean branches, no hidden source-truth conflicts, updated connector map.

## Phase 1: Bridge Foundation

- Install unified event bridge routes from PR #13 after conflict resolution.
- Preserve secret-name-only visibility.
- Keep policy checks on every write/execute/admin route.
- Add Google Chat webhook connector as approval/notification bridge.
- Add n8n inbound/outbound bridge contract with HMAC auth and receipt logging.

Exit criteria: heartbeat, secret names only, harmless read/write/command, Git status, and policy-check smoke pass.

## Phase 2: Supabase Safety And Persistence

- Apply migrations only to Supabase development branch first.
- Add/fix RLS policies for bridge-critical tables.
- Fix mutable search-path and security-definer advisor warnings that affect bridge safety.
- Install event bus, generator queue, receipts, approvals, and proof tables.
- Re-run security and performance advisors.

Exit criteria: branch migration succeeds, advisors are clean or documented non-blocking, event writes/retries are verified in sandbox.

## Phase 3: Vercel Workflow And Sandbox Runtime

- Implement durable Vercel Workflow stages: intake, packet, sandbox, validation, approval, preview, release hold.
- Keep five-minute cron triggers non-mutating by default.
- Use Vercel Sandbox for untrusted or code-generating work.
- Store receipts for each stage in Supabase.

Exit criteria: workflow dry run produces receipts, retry behavior works, sandbox build emits proof artifacts.

## Phase 4: AI Gateway And Agents

- Route model calls through AI Gateway with model allowlist, budget caps, and fallback policy.
- Add Vercel Agent manifests for Planner, Builder, QA, Governance, Recovery, Browser, and Connector agents.
- Record model/run cost and decision receipts.

Exit criteria: model route smoke, cost receipt, fallback receipt, agent handoff receipt.

## Phase 5: v0 Frontend Sync

- Add panels for generator status, queue, receipts, approvals, build packet viewer, connector readiness, and browser evidence.
- Ensure frontend reads from backend state routes and submits only governed commands.
- Add clear disabled/approval states for protected actions.

Exit criteria: browser screenshot smoke on desktop/mobile, panels show live state, no secret values exposed.

## Phase 6: Evidence And Merge Gates

- Run POST smoke against `/api/bridge/policy-check`.
- Run browser screenshot smoke against AUTO_BUILDER and v0 previews.
- Run connector widening sequence: heartbeat, secret names only, harmless read, harmless write, harmless command, browser screenshot, git status, connector-by-connector widening.
- Merge AUTO_BUILDER only after clean smoke evidence.
- Merge v0 only after backend route contracts are stable.

Exit criteria: proof pack, screenshots, API receipts, PR mergeability true, explicit approval for any production step.

## Human Approval Gates

Approval is required for production deploy, production Supabase mutation, secret creation/rotation, Shopify/Stripe mutation, social publishing, external customer messaging, irreversible deletion, or capital spend.
