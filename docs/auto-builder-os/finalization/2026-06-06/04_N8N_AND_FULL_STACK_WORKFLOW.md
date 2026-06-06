# n8n And Full Stack AUTO BUILDER Workflow

## Objective

Use n8n as the external automation router while AUTO BUILDER OS remains the governed source of orchestration truth. n8n should move events, call connectors, and trigger external workflows. It should not bypass approval gates.

## Full Stack

- GPT Business: operator/orchestration surface.
- AUTO BUILDER backend: policy, bridge, workflow, queue, evidence.
- v0 AUTO BUILDER OS frontend: control plane.
- GitHub: repo, branches, PRs, Actions.
- Vercel: previews, workflows, sandbox, crons, agents.
- Supabase: state, queues, approvals, receipts, audit logs.
- Google Drive: source truth and client delivery docs.
- Google Chat: approvals and notifications.
- n8n: external routing and workflow automation.
- AI Gateway: model routing/cost/fallback.
- Codex: branch-scoped implementation.
- Playwright: browser screenshots and UI tests.
- Shopify: store and commerce layer.
- HeyGen: video/avatar generation.
- Xyla: social creative generation/posting support.
- Metricool: social scheduling and analytics.

## n8n Workflow: Idea To System-In-A-Box

1. Trigger: GPT or frontend posts to AUTO BUILDER `/api/bridge/inbound`.
2. AUTO BUILDER validates HMAC and records `bridge_events`.
3. n8n receives queued event via outbound dispatch or polling.
4. n8n routes by phase:
   - discovery
   - plan
   - brand
   - build
   - deploy-preview
   - social-draft
   - approval
   - operate
5. n8n calls approved connectors or returns task to AUTO BUILDER queue.
6. Receipts return to AUTO BUILDER `/api/bridge/inbound`.
7. Supabase stores status, logs, evidence, and next action.
8. v0 frontend updates through API/realtime.
9. Google Chat receives approval requests when protected gates appear.
10. Release remains blocked until evidence is clean and approval exists.

## Required n8n Workflows

1. `autobuilder-intake-router`
   - Receives new idea/build request.
   - Calls discovery/benchmark route.
   - Creates build packet task.

2. `autobuilder-connector-router`
   - Routes bridge events to GitHub, Vercel, Supabase, Drive, Shopify, HeyGen, Xyla, Metricool.
   - Uses allowlisted actions only.

3. `autobuilder-approval-router`
   - Sends Google Chat approval messages.
   - Records operator decision.
   - Calls AUTO BUILDER approval callback.

4. `autobuilder-social-draft-router`
   - Creates draft social queue.
   - Calls HeyGen/Xyla/Metricool draft paths.
   - Never auto-publishes without approval.

5. `autobuilder-retry-and-recovery`
   - Polls failed/retry events.
   - Applies exponential backoff.
   - Routes stuck events to Recovery Agent.

6. `autobuilder-analytics-feedback`
   - Pulls Metricool/social/site/store analytics.
   - Records performance signals.
   - Triggers optimization or replication plan.

## HMAC Contract

Every n8n inbound/outbound request must include:

- timestamp
- event id
- source system
- target system
- HMAC-SHA256 signature
- idempotency key

AUTO BUILDER must reject missing, stale, or invalid signatures.

## Supabase Tables

- `bridge_events`
- `bridge_connections`
- `bridge_credentials`
- `workflow_runs`
- `workflow_steps`
- `approval_requests`
- `tool_receipts`
- `social_assets`
- `social_posts`
- `browser_evidence`
- `build_packets`

## Five-Minute Cron Policy

Five-minute crons are allowed only for safe ticks:

- check pending queues
- retry eligible failed events
- refresh status
- collect receipts
- run non-mutating readiness checks

They must not perform production deploys, live store writes, public social publishing, payment actions, or destructive actions without approved queued work.

## Acceptance Tests

- Invalid HMAC rejected.
- Valid harmless inbound event queued.
- n8n receives and returns receipt.
- Duplicate event is idempotent.
- Failed event retries with backoff.
- Protected action creates approval request.
- Google Chat approval callback updates Supabase.
- Frontend reflects state.
- No secret value is exposed.
