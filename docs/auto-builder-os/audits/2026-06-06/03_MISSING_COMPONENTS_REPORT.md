# Missing Components Report

## Critical Missing Components

1. Fresh unified bridge branch from current main.
   - PR #13 has valuable bridge/generator/event-bus work, but it is diverged. A clean install branch is required before merge.

2. Google Chat connector replacement.
   - Slack remains in runtime/factory connector language. Replace with Google Chat webhook and Google Workspace-native approval routing.

3. Supabase safety repair pack.
   - Advisors show RLS-enabled tables without policies, mutable search-path functions, and security-definer execution warnings. These need branch-safe migrations and advisor recheck.

4. Applied AWOS bridge event bus migration.
   - PR #13 includes `bridge_events`, `bridge_connections`, and `bridge_credentials` migration work, but this was not verified as applied to the active Supabase project.

5. Generator queue persistence.
   - Generator routes exist in PR #13, but queue persistence requires approved Supabase table/schema and allowlist policy.

6. AI Gateway runtime contract.
   - Missing verified route/config for AI Gateway provider routing, model allowlist, cost ledger, failure fallback, and per-run receipts.

7. Vercel Workflow implementation.
   - `workflow` dependency exists, but durable workflow stage receipts, retries, and trigger evidence were not verified end to end.

8. Vercel Agents manifests.
   - The OS spec requires agents for planning, sandbox, QA, deployment, governance, and recovery. Manifests and runtime receipts were not verified.

9. n8n bridge contract.
   - n8n is specified as external workflow routing, but inbound/outbound route contracts, webhook auth, retries, and receipts are not verified.

10. v0 bidirectional OS frontend.
    - v0 has a newer AUTO BUILDER OS UI branch and an older bridge command-center PR. The current production UI is not verified as connected bidirectionally to latest backend bridge/state routes.

## Important Missing Components

- Browser screenshot smoke evidence for current AUTO_BUILDER and v0 previews.
- GitHub Actions dispatch smoke evidence for safe workflow reads/dispatches.
- Secrets inventory UI that shows names/status only, never values.
- Connector-by-connector widening matrix with read, write, execute, admin, rollback, and approval-state columns.
- Canonical approval policy replacing generic Slack gates with Google Chat and in-app approval queues.
- Build packet viewer in frontend.
- Queue, receipts, approvals, and runtime status panels in frontend.
- Release hold dashboard for PR #13 and v0 PR #1.
- Supabase realtime subscriptions for event transitions.
- Dead-letter queue and retry receipt viewer.

## Deferred Components

- Stripe mutation bridge: deferred until payday phase.
- Shopify mutation widening: keep gated; Shopify payments/store writes require explicit approval and sandbox/test proof.
- Auto-publish social distribution: gated until Google Chat approvals and platform compliance receipts exist.

## Minimum Definition Of Complete

AUTO BUILDER OS v1.0 is complete enough for governed operation when:

- Source docs, route contracts, and frontend panels agree.
- PR #13 work is reconciled into current main or rebuilt cleanly.
- Supabase advisors are clean for bridge-critical tables/functions.
- Google Chat replaces Slack in connector maps and approval workflows.
- Vercel Workflow, Sandbox, AI Gateway, Vercel Agents, Codex, and n8n packets are implemented and smoke-tested.
- Browser screenshots and API smoke receipts are captured.
- Production deploy/merge remains gated until evidence is clean.
