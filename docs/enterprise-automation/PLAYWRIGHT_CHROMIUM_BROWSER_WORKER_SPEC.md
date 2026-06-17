# Playwright Chromium Browser Worker Specification

Date: 2026-06-17
Route: `/api/browser/process`
Runtime target: Vercel Node.js serverless runtime
Cadence target: every 5 minutes

## Purpose

The browser worker gives Auto Builder real browser validation capability: load pages, capture desktop/mobile screenshots, detect console/page errors, verify task evidence, and write browser receipts. This enables automated validation for web pages, admin dashboards, forms, landing pages, image approval pages, and workflow UIs.

## Existing Implementation

The repo already includes:

- `playwright`
- `playwright-core`
- `@sparticuz/chromium`
- `/api/browser/process`
- `scripts/nrw-browser-task-worker.mjs`
- telemetry table names for browser tasks, claims, evidence, blockers, screenshots, and worker heartbeats

The Vercel route already contains serverless Chromium logic:

- if `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` exists, use that executable
- if running on Vercel/AWS-like runtime, use `@sparticuz/chromium` with `playwright-core`
- otherwise use local `playwright`

## Required Vercel Env

Install after preview deployment is known:

```text
PLAYWRIGHT_WORKER_URL=https://<auto-builder-vercel-domain>/api/browser/process
```

Optional fallback/alias:

```text
PLAYWRIGHT_HEARTBEAT_URL=https://<auto-builder-vercel-domain>/api/browser/process
```

Optional explicit executable override:

```text
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<absolute-path-if-provider-requires-it>
```

Do not set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` unless the default `@sparticuz/chromium` path fails.

## Required Secrets And Runtime Env

Required for full worker persistence:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- cron authorization secret accepted by `authorizeCronRequest`

Recommended:

- `AUTO_BUILDER_OPERATOR_TOKEN`
- `AUTO_BUILDER_BRIDGE_TOKEN`
- `BROWSER_WORKER_NAME=vercel_playwright_browser_worker`
- `AUTO_BUILDER_AUTONOMY_MODE=draft_safe`

## Route Responsibilities

`/api/browser/process` must:

1. Select a claimed browser task without evidence.
2. Prefer priority/special-case tasks when appropriate.
3. Write worker heartbeat with `running` status.
4. Launch Chromium.
5. Capture desktop screenshot.
6. Capture mobile screenshot.
7. Capture page title, status code, console errors, and page errors.
8. Write screenshot evidence.
9. Execute only approved/safe task behavior.
10. Write evidence receipt.
11. Mark task as completed or blocked.
12. Write worker heartbeat with completed/blocked/error status.
13. Return structured JSON.

## Safety Rules

Allowed autonomously:

- load public/internal validation URLs
- capture screenshots
- capture console/page errors
- write internal browser evidence
- write internal blocker rows
- mark browser task completed/blocked
- validate admin UI visibility if authorized by route/session

Approval required:

- submitting forms that create real customer data
- credentialed browser sessions
- purchases/payments
- Shopify mutations
- posting social content
- sending messages
- deleting content
- updating production settings

Blocked by default:

- payment actions
- public social publishing
- customer messages
- destructive browser actions
- secret entry into unknown pages
- credentialed browsing without explicit target/account approval

## Browser Task Input Contract

A browser task should include:

```json
{
  "id": "uuid",
  "task_type": "screenshot_qa|form_qa|admin_ui_qa|route_health|visual_regression",
  "task_prompt": "plain-language task",
  "target": "https://example.com/path",
  "priority": "low|normal|high|urgent",
  "approved": true,
  "safe": true,
  "state": "claimed"
}
```

## Browser Evidence Output Contract

Evidence should include:

```json
{
  "worker": "vercel_playwright_browser_worker",
  "taskId": "uuid",
  "target": "https://example.com/path",
  "startedAt": "iso",
  "completedAt": "iso",
  "screenshots": [
    {
      "name": "desktop",
      "width": 1440,
      "height": 1200,
      "statusCode": 200,
      "title": "Page title",
      "consoleErrors": [],
      "screenshotBytes": 123456
    },
    {
      "name": "mobile",
      "width": 390,
      "height": 844,
      "statusCode": 200,
      "title": "Page title",
      "consoleErrors": [],
      "screenshotBytes": 123456
    }
  ],
  "blocker": null
}
```

## Validation Checks

The browser worker is healthy when:

- `PLAYWRIGHT_WORKER_URL` is installed in the target Vercel env
- `/api/browser/process` returns JSON
- worker heartbeat writes successfully
- Chromium launches in Vercel runtime
- desktop screenshot succeeds
- mobile screenshot succeeds
- task state updates to completed/blocked
- browser evidence row exists
- no protected action executed

## Common Failure Modes

| Failure | Likely Cause | Fix |
| --- | --- | --- |
| Chromium executable missing | serverless binary path failed | use `@sparticuz/chromium`; only set explicit path if needed |
| timeout on `networkidle` | target page long-polling or slow assets | use more targeted wait strategy in later patch |
| telemetry 400 | schema mismatch | write verified columns only |
| no task selected | queue has no claimed safe tasks | seed browser task or claim queue item |
| screenshots too large | full-page image payload too heavy | store in object storage and persist reference |
| Vercel max duration hit | too many tasks per route invocation | process one task per 5-minute tick |

## Scaling Model

Start with one task per 5-minute cron. Scale only after evidence proves stability.

Recommended phases:

1. one task per tick
2. max two screenshots per task
3. no credentialed sessions
4. object-storage screenshots instead of data URLs
5. queue concurrency by priority
6. browser worker split by domain/project
7. dedicated browser worker deployment if Vercel function limits become binding

## Vercel Operator Installation Steps

1. Deploy this branch to Vercel preview.
2. Confirm preview build passes.
3. Confirm `/api/browser/process` route exists.
4. Set preview env:

```text
PLAYWRIGHT_WORKER_URL=https://<preview-domain>/api/browser/process
```

5. Trigger preview redeploy if Vercel requires env rebuild.
6. Run read-only route validation.
7. Confirm worker heartbeat/evidence writes.
8. Set production env only after preview passes:

```text
PLAYWRIGHT_WORKER_URL=https://<production-domain>/api/browser/process
```

9. Confirm production cron runs every 5 minutes.
10. Do not enable credentialed or mutating browser tasks until explicitly approved.

## Definition Of Done

Browser worker installation is complete only when:

- Vercel build passes
- 5-minute cron is active
- `PLAYWRIGHT_WORKER_URL` exists in the intended Vercel env
- route returns valid JSON
- Chromium launches
- desktop/mobile screenshots are captured
- telemetry/evidence persists
- validation agent marks browser worker pass
- protected actions remain disabled
