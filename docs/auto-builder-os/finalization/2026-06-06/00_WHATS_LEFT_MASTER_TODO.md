# AUTO BUILDER OS Finalization: What Is Left

Date: 2026-06-06
Scope: final autonomous business-building system for AI consulting, one-hour system-in-a-box delivery, and full-stack governed automation.

## Done Means

AUTO BUILDER OS is complete when a user can give GPT one idea and the system can run:

DISCOVERY -> BRANDING -> BUILD DOCS -> SANDBOX BUILD -> HARDENING -> PREVIEW -> APPROVAL -> RELEASE HANDOFF -> AUTO SOCIAL SYSTEM -> OPERATIONS

The output must be a system-in-a-box with website, store when needed, admin control plane, docs, workflows, social automation, receipts, rollback plan, and clear env/account connection instructions. Production actions remain gated.

## Critical Remaining Work

1. Reconcile repo branches.
   - Rebase/update PR #14 if keeping docs in main.
   - Reconstruct PR #13 from current main before merging bridge/generator/event bus code.
   - Reconcile v0 bridge UI with newest AUTO BUILDER OS frontend branch.

2. Replace Slack with Google Chat.
   - Remove Slack from connector maps, docs, UI copy, readiness routes, env lists, and approval routing.
   - Add Google Chat webhook/bot connector docs and runtime route.

3. Supabase safety repair.
   - Fix RLS-enabled-no-policy warnings for bridge-critical tables.
   - Fix mutable search-path function warnings.
   - Review public/signed-in SECURITY DEFINER function execution.
   - Apply only on Supabase development branch first.

4. Bridge event bus completion.
   - Install/reconcile `bridge_events`, `bridge_connections`, `bridge_credentials`.
   - Add realtime subscriptions.
   - Add dead-letter and retry receipts.
   - Run HMAC and bearer POST smoke.

5. Frontend bidirectional sync.
   - v0 AUTO BUILDER OS frontend must read live backend state and submit governed commands.
   - Add panels for queue, receipts, approvals, agents, workflows, browser evidence, connectors, build packet viewer, social system, and release holds.

6. Vercel Workflow implementation.
   - Durable stages, five-minute tick, idempotency, retries, evidence archive, approval stop.
   - Cron must be non-mutating by default unless approved queued work exists.

7. Vercel Sandbox implementation.
   - Sandbox run records, branch-scoped jobs, preview receipts, screenshot receipts, rollback reference.

8. AI Gateway implementation.
   - Model routing, model allowlist, budget caps, fallback route, cost receipts, run logs.

9. Vercel Agents implementation.
   - Planner, Builder, QA, Governance, Recovery, Browser, Connector, Social, Commerce, Brand agents.
   - Each agent needs manifest, scopes, approvals, receipts, and failure mode.

10. Codex job bridge.
    - Queue-backed branch-scoped code jobs.
    - GitHub Actions dispatch/read logs.
    - Draft PR and evidence receipts.

11. n8n workflow bridge.
    - HMAC inbound/outbound, replay, retry, receipts, connector registration.
    - Google Chat approvals and external tool routing.

12. Full auto social system.
    - Brand extraction, content strategy, asset generation, caption/script generation, approval queue, Xyla/HeyGen/Metricool routing, analytics feedback, repurposing loop.

13. GPT Business account pack.
    - Account purpose, folder structure, custom GPT instructions, operating README, knowledge file list, action/MCP requirements, approval policy, and operator rules.

14. Full-stack stack connector matrix.
    - GitHub, Drive, Supabase, Vercel, Shopify, HeyGen, Xyla, Metricool, n8n, AI Gateway, Codex, Playwright local/cloud.
    - Each must define read/write/execute/admin scopes and approval gates.

15. Smoke and acceptance evidence.
    - Heartbeat.
    - Secret names only.
    - Harmless read/write/command.
    - Browser screenshot.
    - Git status.
    - Connector-by-connector widening.
    - Workflow dry run.
    - Social draft run.
    - Store/admin/dashboard preview.

## Non-Negotiable Gates

- No production deploy without explicit approval.
- No Supabase production migration without branch proof and advisor review.
- No secrets in repo, chat, logs, screenshots, or UI.
- No Stripe mutation until payday phase.
- No Shopify live mutation without explicit approval.
- No auto-publish social without approval and platform compliance checks.
- No customer-facing messages without approval.

## Immediate Build Order

1. Merge docs/proof branch after rebase.
2. Build clean bridge branch from current main.
3. Add Google Chat connector replacement.
4. Add Supabase safety repair branch.
5. Add workflow/sandbox/agent/AI Gateway/Codex routes.
6. Reconcile v0 UI.
7. Add n8n workflow bridge.
8. Add auto social system.
9. Run full smoke and screenshot suite.
10. Merge only after clean evidence.
