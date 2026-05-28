# AUTO BUILDER BROWSER AGENT BRIDGE ARCHITECTURE

## Purpose
Define the governed architecture for connecting AUTO BUILDER GPT MCP to browser automation through a Playwright/browser worker. This enables GPT to operate as a browser-control planning layer while preserving governance, receipts, approval gates, and continuity.

## Current Status
AUTO BUILDER has:
1. Hardened governance spine.
2. Recursive continuity architecture.
3. Operational workflow tree.
4. Validation architecture.
5. GPT MCP connected bridge.
6. Governed MCP executor expansion roadmap.
7. Layer-1/Layer-2 executor contracts.
8. MCP helper implementation architecture.

## Target Capability
AUTO BUILDER Browser Agent Bridge should support:
1. Headless browser validation.
2. Headful browser review when needed.
3. Route testing.
4. Screenshot capture.
5. Page text extraction.
6. Form-readiness checks.
7. Dashboard inspection.
8. Approval-gated browser actions.
9. Receipts and logs after every browser task.
10. Recursive continuation back into AUTO BUILDER.

## Core Architecture

```text
GPT / AUTO BUILDER MCP
  -> browser task packet tool
  -> governance preflight
  -> Supabase queue or task API
  -> Playwright worker
  -> controlled browser session
  -> screenshots / logs / extracted data
  -> execution receipt
  -> AUTO BUILDER continuity / telemetry / final block
```

## Control Plane Boundary
GPT MCP is the browser control plane. It may create task packets, classify governance, request screenshots, request text extraction, and record receipts.

GPT MCP must not silently perform protected browser actions. Protected browser actions require approval gates.

## Browser Worker Boundary
The Playwright worker executes approved browser tasks. It must:
1. Navigate only to allowed URLs.
2. Capture logs and screenshots.
3. Return structured receipts.
4. Stop before protected actions.
5. Never bypass login, MFA, CAPTCHA, paywalls, or platform controls.
6. Never store secrets in repo or chat.
7. Never mutate live systems without approval.

## Vercel Orchestration Boundary
Vercel can host:
1. MCP browser task tools.
2. Task packet API routes.
3. Browser task status routes.
4. Receipt routes.
5. Queue orchestration.
6. Short validation checks.

Vercel should not be treated as the primary host for persistent headful browser sessions.

## Recommended Worker Options
1. Browserbase or hosted browser service.
2. Railway Playwright worker.
3. Render Playwright worker.
4. Fly.io Playwright worker.
5. GitHub Codespaces worker.
6. Local bridge daemon when Jeremy explicitly wants real local-browser control.

## Headless Mode
Best for:
1. Route validation.
2. Page text extraction.
3. Screenshot capture.
4. Dashboard read-only inspection.
5. Form-readiness checks.
6. Non-interactive testing.

## Headful Mode
Best for:
1. Manual login.
2. Visual review.
3. Human approval before protected action.
4. Account dashboards with visual state.
5. Browser tasks requiring intervention.

## Protected Browser Actions
Browser worker must stop and request approval before:
1. Purchases.
2. Payments.
3. Refunds.
4. Stripe money movement.
5. Shopify writes.
6. Live publishing.
7. Account setting changes.
8. Permission changes.
9. Deletion.
10. Sending outbound messages.
11. Submitting forms with legal, financial, or account impact.
12. Any irreversible action.

## GPT MCP Browser Control-Plane Tools
First read-only and receipt-producing tools:
1. `create_browser_task_packet`
2. `get_browser_task_status`
3. `validate_browser_route`
4. `request_browser_screenshot`
5. `extract_browser_page_text`
6. `record_browser_execution_receipt`

Future approval-gated tools:
1. `browser_governance_preflight`
2. `approve_browser_protected_action`
3. `pause_browser_task`
4. `retry_browser_task`
5. `dead_letter_browser_task`
6. `run_governed_browser_step`

## Supabase Browser Task Queue Model
Future table or queue structure:

```json
{
  "browserTaskId": "stable ID",
  "phaseStep": "PHASE-X / STEP-Y",
  "status": "planned | queued | running | blocked | needs_human | completed | failed",
  "mode": "headless | headful",
  "targetUrl": "https://example.com",
  "taskType": "validate_route | screenshot | extract_text | inspect_dashboard | governed_step",
  "approvalState": "not_required | pending | approved | rejected",
  "idempotencyKey": "stable key",
  "requestedBy": "AUTO_BUILDER_GPT_MCP",
  "workerId": "worker identifier",
  "payload": {},
  "result": {},
  "screenshotUrl": "optional",
  "logUrl": "optional",
  "receiptId": "receipt ID",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

Layer-1 planning may return this structure without writing to Supabase. Layer-3 persistence may write only after schema and approval validation.

## Browser Task Packet Structure

```json
{
  "browserTaskId": "stable ID",
  "phaseStep": "PHASE-X / STEP-Y",
  "taskType": "validate_route | screenshot | extract_text | inspect_dashboard | governed_step",
  "mode": "headless | headful",
  "targetUrl": "https://example.com",
  "allowedDomains": ["example.com"],
  "instructions": "exact browser objective",
  "selectors": [],
  "requiresLogin": false,
  "protectedActionExpected": false,
  "approvalRequired": false,
  "idempotencyKey": "stable key",
  "receiptRequired": true
}
```

## Screenshot / Log / Receipt Structure

```json
{
  "receiptId": "stable ID",
  "browserTaskId": "stable ID",
  "phaseStep": "PHASE-X / STEP-Y",
  "taskType": "screenshot | extract_text | validate_route | governed_step",
  "targetUrl": "https://example.com",
  "status": "ok | blocked | needs_human | failed",
  "mutationPerformed": false,
  "protectedMutationRequested": false,
  "approvalRequired": false,
  "screenshot": {
    "captured": true,
    "storage": "future Drive/Supabase/object storage URL",
    "hash": "optional"
  },
  "logs": [],
  "extractedText": "optional text result",
  "blockers": [],
  "workarounds": [],
  "selfHeal": [],
  "nextInstruction": "copyable NEXT GPT INSTRUCTION",
  "createdAt": "ISO-8601"
}
```

## Browser Governance Preflight
Classify every browser task before execution:
1. `SAFE_READ_ONLY`
2. `SAFE_SCREENSHOT_ONLY`
3. `SAFE_TEXT_EXTRACTION_ONLY`
4. `APPROVAL_REQUIRED`
5. `BLOCKED_PROTECTED_ACTION`

Protected indicators:
1. `submit`
2. `purchase`
3. `pay`
4. `refund`
5. `delete`
6. `publish`
7. `send`
8. `update product`
9. `change price`
10. `change account setting`
11. `rotate secret`
12. `deploy`
13. `billing`

## Retry / Backoff
1. Maximum retries: 3.
2. Backoff: 1 minute, 5 minutes, 15 minutes.
3. Stop immediately on protected-action conflict.
4. Stop immediately on login/MFA/CAPTCHA block.
5. Preserve blocker receipt.
6. Escalate to HUMAN NEEDED after exhausted retries.

## Safe Session Handling
1. Do not store secrets in repo.
2. Do not paste passwords into chat.
3. Do not bypass MFA.
4. Do not preserve cookies without explicit approved storage policy.
5. Use isolated browser context per task when possible.
6. Use human-assisted login only when approved.
7. Store only receipts, screenshots, and non-sensitive logs.

## First Read-Only Browser Tools

### create_browser_task_packet
Creates a browser task packet without executing it.

### get_browser_task_status
Returns planned or queued task status.

### validate_browser_route
Validates route status and expected page load behavior.

### request_browser_screenshot
Requests screenshot capture through worker.

### extract_browser_page_text
Requests page text extraction through worker.

### record_browser_execution_receipt
Creates receipt after browser task completes or blocks.

## Implementation Phases

### PHASE-BROWSER-1 : Architecture And Contracts
1. Create architecture package.
2. Define task packet structure.
3. Define receipt structure.
4. Define governance preflight.
5. Define worker boundary.

### PHASE-BROWSER-2 : MCP Task Packet Tools
1. Add read-only MCP tools.
2. No browser execution yet.
3. Return task packets and receipts only.

### PHASE-BROWSER-3 : Queue Persistence
1. Add Supabase queue after schema approval.
2. Add status reads.
3. Add receipt persistence.

### PHASE-BROWSER-4 : Playwright Worker
1. Add worker outside Vercel if persistent browser is needed.
2. Add headless route validation.
3. Add screenshot and text extraction.

### PHASE-BROWSER-5 : Approval-Gated Browser Actions
1. Add approval gate checks.
2. Add pause/resume.
3. Add protected action approval.
4. Add rollback/receipt policy.

### PHASE-BROWSER-6 : Autonomous Browser Loop
1. Add cron-safe loop checks.
2. Add retry/backoff.
3. Add dead-letter queue.
4. Add continuity reporting.

## Completion Criteria
Browser Agent Bridge is complete when:
1. GPT MCP can create browser task packets.
2. Worker can execute read-only tasks.
3. Screenshots and logs return as receipts.
4. Protected actions pause for approval.
5. Queue state is durable.
6. Browser actions are idempotent where possible.
7. Continuity is preserved after each browser pass.
8. Recursive NEXT GPT INSTRUCTION can resume safely.

## Final Rule
Browser autonomy must be governed autonomy. GPT may orchestrate browser work through MCP and workers, but protected actions require explicit approval and receipts.
