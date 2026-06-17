# Vercel Validation Agents Specification

Date: 2026-06-17
Scope: validation-only Vercel Agents for Auto Builder enterprise automation.

## Mission

Vercel validation agents must continuously verify that the automation system is healthy, safe, observable, and allowed to continue. They do not publish, message customers, mutate commerce, change secrets, deploy production, spend money, or apply database migrations.

## Agent Operating Modes

| Mode | Meaning | External Consequence Allowed |
| --- | --- | --- |
| `off` | agent disabled | no |
| `monitor` | read-only health and telemetry checks | no |
| `draft_safe` | read, diagnose, draft receipts, queue internal fixes | no public consequence |
| `approval_ready` | package action for human approval | no until approved |
| `live_guarded` | execute pre-approved internal actions only | limited |
| `emergency_stop` | pause automation and preserve evidence | no |

Default mode must be `draft_safe`.

## Required Validation Agents

### 1. Cron Health Validator

Purpose:

- verify Vercel cron routes are present and returning valid JSON
- verify 5-minute routes are not stale
- verify cron authorization behavior

Inputs:

- `vercel.json`
- route responses
- Vercel deployment status
- scheduler telemetry

Outputs:

- `cron_health_receipt`
- route status matrix
- stale route blockers

### 2. Telemetry Validator

Purpose:

- verify telemetry tables accept writes
- detect schema-cache errors
- detect missing service-role configuration
- classify telemetry as persisted, dry-run, blocked, or failed

Inputs:

- `runtime_telemetry_events`
- `worker_heartbeats`
- `execution_traces`
- route telemetry payloads

Outputs:

- `telemetry_validation_receipt`
- schema mismatch blockers
- migration-required or code-compatibility-required decision

### 3. Receipt Validator

Purpose:

- decide whether receipts are evidence-created, artifact-backed, telemetry-backed, and validator-cleared
- prevent advancement when receipts are missing or partial

Inputs:

- `docs/auto-builder-os/validation/master-completion-validator-receipts.json`
- route receipts
- artifact metadata
- telemetry rows

Outputs:

- `receipt_validator_result`
- per-receipt state
- next allowed receipt

### 4. Browser Worker Validator

Purpose:

- verify Playwright/Chromium worker can launch on Vercel
- verify desktop and mobile screenshots are captured
- verify browser evidence persists
- verify blocked tasks are quarantined

Inputs:

- `PLAYWRIGHT_WORKER_URL`
- `/api/browser/process`
- `browser_tasks`
- `browser_claims`
- `browser_evidence`
- `browser_blockers`
- `browser_screenshots`
- `worker_heartbeats`

Outputs:

- `browser_worker_validation_receipt`
- latest worker status
- screenshot evidence state
- browser blocker summary

### 5. Queue Validator

Purpose:

- verify queues are draining without runaway loops
- detect stale jobs, repeated failures, and dead letters
- protect against duplicate processing

Inputs:

- queue tables
- claim ledgers
- worker heartbeats
- retry counts

Outputs:

- `queue_health_receipt`
- stale job list
- dead-letter recommendations

### 6. Governance Validator

Purpose:

- verify protected actions remain disabled by default
- verify public/social/customer/commerce/payment/secret/deploy actions require approval
- detect unsafe runtime mode

Inputs:

- env contract
- governance docs
- route responses
- approval queues

Outputs:

- `governance_validation_receipt`
- blocked-action matrix
- emergency-stop recommendation when needed

### 7. Cost Governor Validator

Purpose:

- monitor OpenAI, AI Gateway, image generation, and browser task costs
- pause draft generation when caps are approached

Inputs:

- model invocation telemetry
- generation queue volume
- approval/rejection ratio
- cost caps

Outputs:

- `cost_governor_receipt`
- continue/pause decision
- provider degradation state

### 8. Deployment Validator

Purpose:

- verify Vercel preview and production deployments
- inspect failures when Vercel logs are available
- prevent merge/promotion while builds fail

Inputs:

- GitHub PR status
- Vercel deployment status
- Vercel logs when available

Outputs:

- `deployment_validation_receipt`
- pass/fail status
- exact build blocker

### 9. Source Truth Validator

Purpose:

- reconcile Drive, GitHub, docs, manifests, and runtime state
- detect stale PRs and drifted docs

Inputs:

- GitHub docs
- Drive docs
- validation manifests
- PR metadata

Outputs:

- `source_truth_validation_receipt`
- drift matrix
- canonical handoff state

## Agent Permission Model

Allowed without further approval:

- read GitHub files and PR metadata
- read Vercel deployment status/logs
- read route responses
- read Supabase telemetry
- write internal validation receipts
- write internal blockers
- write internal queue health summaries
- draft GitHub PRs with docs or safe code changes

Approval required:

- merge PR
- deploy or promote production
- rerun production workflows
- apply migrations
- mutate Vercel env vars
- rotate secrets
- publish social content
- send messages
- mutate Shopify or payments
- spend money
- delete or share Drive files
- perform destructive GitHub actions

Blocked by default:

- public posting
- customer messaging
- paid promotion
- Shopify writes
- payment changes
- production DB migrations
- domain/DNS changes
- credentialed browser actions beyond explicitly approved validation
- secret exposure

## Required Agent Output Schema

Each validation agent must return:

```json
{
  "ok": true,
  "agent": "browser-worker-validator",
  "mode": "draft_safe",
  "generated_at": "2026-06-17T00:00:00.000Z",
  "status": "pass|warning|blocked|failed",
  "checks": [],
  "blockers": [],
  "protected_actions_executed": false,
  "external_consequence_executed": false,
  "telemetry_status": "persisted|dry_run|blocked|failed",
  "receipt_id": "browser_worker_validation_receipt",
  "next_action": "..."
}
```

## Validation Escalation Rules

Escalate to human when:

- a protected action is required
- Vercel env mutation is required
- migration is required
- costs exceed cap
- a route fails repeatedly
- browser worker cannot launch Chromium
- secrets are missing
- telemetry schema mismatch persists
- unauthorized route access succeeds
- public execution flag is true unexpectedly

## Definition Of Validator-Cleared

A lane is validator-cleared only when:

- source artifact exists
- route or workflow evidence exists
- telemetry persisted or dry-run reason is acceptable
- protected actions remain false
- blocker list is empty or explicitly accepted
- receipt status is recorded
- next stage is allowed by governance

## Required Vercel Env For Validation Agents

Required:

- `AUTO_BUILDER_OPERATOR_TOKEN`
- `AUTO_BUILDER_BRIDGE_TOKEN`
- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PLAYWRIGHT_WORKER_URL`

Recommended:

- `PLAYWRIGHT_HEARTBEAT_URL`
- `MODEL_TELEMETRY_ENABLED=true`
- `GROWTH_PUBLIC_EXECUTION_ENABLED=false`
- `AUTO_BUILDER_AUTONOMY_MODE=draft_safe`

## Vercel Env Installation Requirement

After the browser worker route is deployed, install:

```text
PLAYWRIGHT_WORKER_URL=https://<auto-builder-domain>/api/browser/process
```

For preview validation, use the preview deployment domain. For production validation, use the production domain after preview passes.

Do not mark this complete until the Vercel project environment settings or Vercel API confirms the value exists in the intended environment.
