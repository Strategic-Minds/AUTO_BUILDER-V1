# Vercel Workflows And 5-Minute Cron Builder Doc List

Date: 2026-06-17
Target repo: `Strategic-Minds/AUTO_BUILDER`
Target cadence: every 5 minutes for active control, validation, generator, social, browser, and health lanes.

## Operating Goal

Create a governed Vercel automation layer that can run continuously while preserving safety gates. The system should discover work, validate readiness, process internal queues, capture browser evidence, diagnose failures, and write receipts without public or destructive actions unless a human explicitly approves them.

## Core Principles

- 5-minute cadence is for control and validation, not reckless execution.
- Every cron route must authenticate through the cron authorization layer.
- Every route must return structured JSON.
- Every route must record telemetry or explicitly report why telemetry was unavailable.
- Every route must preserve protected-action locks.
- Every route must be idempotent or bucketed to prevent duplicate execution.
- Every route must produce or reference a receipt.
- Every route must separate draft-safe work from external consequences.

## Existing 5-Minute Orchestration Lanes

| Lane | Route | Current Schedule | Purpose | Status |
| --- | --- | --- | --- | --- |
| Recursive control | `/api/cron/recursive-control` | `*/5 * * * *` | Creates a bounded workflow bucket, ranks next task, queues durable workflow. | Implemented |
| Generator tick | `/api/cron/autobuilder-generator` | `*/5 * * * *` | Builds generator plan and writes runtime telemetry. | Implemented, telemetry compatibility under separate PR |
| Social bridge | `/api/cron/social-bridge` | `*/5 * * * *` | Runs social bridge control loop. | Implemented |
| Browser worker | `/api/browser/process` | changed from `*/10` to `*/5` | Claims browser tasks, launches Playwright/Chromium, captures screenshots/evidence. | Implemented and accelerated by this package |

## Existing Non-5-Minute Support Lanes

| Lane | Route | Current Schedule | Purpose | Target Future State |
| --- | --- | --- | --- | --- |
| Auto Builder validate | `/api/autobuilder/validate` | hourly | Basic audit/readiness response. | Upgrade into validation-agent aggregator. |
| Auto Builder audit | `/api/autobuilder/audit` | daily | Daily audit lane. | Keep daily; feed summary into validation agents. |
| Factory readiness | `/api/cron/factory-readiness` | hourly | Factory readiness checks. | Keep hourly unless it becomes a blocker. |
| Reverse engineering passive | `/api/cron/reverse-engineering-passive` | daily | Passive reverse-engineering pass. | Keep daily unless active discovery requires more. |
| Bridge retry | `/api/bridge/retry` | every 2 minutes | Retry bridge queue. | Keep fast, but verify rate limits. |

## Required Builder Docs And Artifacts

### 1. Workflow Map

Required file:

- `docs/enterprise-automation/VERCEL_WORKFLOWS_CRONS_5_MIN_BUILDER_DOC_LIST.md`

Must define:

- route
- cadence
- owner
- trigger type
- authentication
- idempotency key
- queue touched
- telemetry table
- receipt type
- safe-mode behavior
- blocked actions
- retry behavior
- rollback behavior
- validation agent responsible

### 2. Workflow Manifest

Required file:

- `docs/enterprise-automation/ENTERPRISE_AUTOMATION_IMPLEMENTATION_MANIFEST.json`

Must be machine-readable and include:

- `workflow_lanes`
- `validation_agents`
- `browser_worker`
- `vercel_env_required`
- `blocked_actions`
- `operator_required_actions`
- `definition_of_done`

### 3. Vercel Cron Config

Required file:

- `vercel.json`

Required active 5-minute entries:

```json
{ "path": "/api/cron/recursive-control", "schedule": "*/5 * * * *" }
{ "path": "/api/cron/autobuilder-generator", "schedule": "*/5 * * * *" }
{ "path": "/api/cron/social-bridge", "schedule": "*/5 * * * *" }
{ "path": "/api/browser/process", "schedule": "*/5 * * * *" }
```

### 4. Cron Authorization Contract

Required behavior:

- reject unauthorized calls
- accept only supported cron headers/tokens
- return accepted header names in failure response
- never expose token value
- write authorization result into response metadata

### 5. Five-Minute Bucket Ledger

Required behavior:

- compute bucket key by UTC 5-minute window
- claim each bucket once per route
- skip duplicates cleanly
- store duplicate claims as safe no-op receipts
- keep duplicate detection independent by route

### 6. Runtime Telemetry

Required tables/signals:

- `runtime_telemetry_events`
- `worker_heartbeats`
- `execution_traces`
- `queue_metrics`
- `browser_tasks`
- `browser_claims`
- `browser_evidence`
- `browser_blockers`
- `browser_screenshots`
- `scheduler_verification`

Telemetry write rules:

- use verified table columns only
- put flexible metadata into JSON payload fields
- never create arbitrary top-level columns without a migration
- report `dry_run` if Supabase env is missing
- fail soft for telemetry write errors unless the route is a validator gate

### 7. Receipt Contract

Each cron lane must emit a receipt with:

- `receipt_id`
- `route`
- `bucket_key`
- `started_at`
- `completed_at`
- `authorization_status`
- `mutation_executed`
- `protected_actions_executed`
- `production_action_allowed`
- `telemetry_status`
- `next_action`
- `blockers`

### 8. Validation Agent Contract

Each route must map to at least one validation agent:

- `cron-health-validator`
- `telemetry-validator`
- `browser-worker-validator`
- `queue-validator`
- `receipt-validator`
- `governance-validator`
- `cost-validator`
- `rollback-validator`

### 9. Browser Worker Contract

Required route:

- `/api/browser/process`

Required Vercel env:

- `PLAYWRIGHT_WORKER_URL=https://<domain>/api/browser/process`

Required dependency set:

- `playwright`
- `playwright-core`
- `@sparticuz/chromium`

Required behavior:

- claim safe approved browser task
- launch Chromium with serverless executable on Vercel
- capture desktop screenshot
- capture mobile screenshot
- capture console/page errors
- write browser evidence
- write worker heartbeat
- mark task completed or blocked
- never execute unsafe browser tasks without approval

### 10. Vercel Agent Validation Contract

Required behavior:

- read manifests and telemetry
- classify each lane as pass, warning, blocked, or failed
- produce actionable blocker list
- never perform protected external writes
- write validation receipt
- escalate exact action needed

## Exhaustive 5-Minute Validation Matrix

| Check | Route/Source | Pass Condition | Failure Action |
| --- | --- | --- | --- |
| Cron auth | all cron routes | unauthorized requests rejected | block route and log |
| Bucket claim | recursive/generator/social/browser | one claim per 5-minute bucket | no-op duplicate |
| Generator plan | generator route | `ok=true`, plan present | block receipt advancement |
| Telemetry insert | generator/browser/control | insert ok or dry-run reason present | mark telemetry blocked |
| Browser launch | browser worker | Chromium launches and closes | create browser blocker |
| Screenshot evidence | browser worker | desktop and mobile screenshots captured | block browser task |
| Queue update | browser worker | task state completed/blocked | create queue blocker |
| Agent plan | recursive control | validation plan present | block workflow advancement |
| Workflow start | recursive control | Vercel workflow run id returned | mark workflow failed |
| Protected gate | all | protected actions false | emergency stop |
| Cost gate | image/model routes | under budget caps | pause generator |
| Storage gate | image/media routes | asset persisted or clear warning | block approval advancement |
| Receipt gate | all | receipt written or explicitly unavailable | block validator cleared state |

## Required Stages To Reach Fully Automated Operation

1. Deploy this cron/browser-worker package to preview.
2. Confirm Vercel build passes.
3. Confirm `/api/browser/process` can run in preview without missing Chromium binary.
4. Install `PLAYWRIGHT_WORKER_URL` in Vercel env for preview.
5. Trigger or wait for 5-minute browser cron.
6. Verify worker heartbeat writes.
7. Verify browser screenshot evidence writes.
8. Verify validation agent reads browser worker health.
9. Install `PLAYWRIGHT_WORKER_URL` in production only after preview evidence passes.
10. Keep all public, paid, destructive, Shopify, customer-message, and deployment mutation actions approval-gated.

## Operator-Gated Actions

These require exact authorization and Vercel-capable tooling:

- add or update Vercel env vars
- redeploy production
- rerun failed production workflows
- promote preview to production
- apply Supabase migrations
- rotate secrets
- enable public publishing
- enable commerce writes
- enable paid actions

## Definition Of Done

The system is not considered enterprise-ready until:

- all active 5-minute crons pass preview validation
- browser worker launches Chromium on Vercel
- worker URL is installed and verified in Vercel env
- validation agents read telemetry and receipts
- receipt validator clears `generator_tick_receipt`
- protected actions remain disabled by default
- admin dashboard surfaces health, queues, receipts, browser evidence, agents, and blockers
- rollback and emergency stop are tested
