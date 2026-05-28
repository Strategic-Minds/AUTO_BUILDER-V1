# AUTO BUILDER BROWSER MCP TOOL CONTRACTS

## Purpose
Define implementation-readiness contracts for the first Browser Agent Bridge MCP tools. These tools are read-only or receipt-producing only. They do not install Playwright, execute live browser actions, create browser sessions, mutate external systems, or bypass approval gates.

## Current System State
AUTO BUILDER contains:
1. Hardened governance spine.
2. Recursive continuity architecture.
3. GPT MCP connected bridge.
4. MCP executor expansion roadmap.
5. Layer-1/Layer-2 executor contracts.
6. MCP helper implementation architecture.
7. Browser Agent Bridge architecture.
8. GPT Workbook Library Repo / GPT Intelligence Data Center.

## Governance Boundary
No browser session, account setting, billing, deployment, database, Shopify, Stripe money movement, Vercel env, Supabase schema, Drive canon, Sheets canon, connector, or authority-file mutation is allowed unless Jeremy explicitly commands that exact mutation in the current session.

## Browser Governance Classifications
1. `SAFE_PACKET_ONLY`
2. `SAFE_STATUS_READ`
3. `SAFE_ROUTE_VALIDATION_REQUEST`
4. `SAFE_SCREENSHOT_REQUEST`
5. `SAFE_TEXT_EXTRACTION_REQUEST`
6. `SAFE_RECEIPT_ONLY`
7. `APPROVAL_REQUIRED`
8. `BLOCKED_PROTECTED_BROWSER_ACTION`

## Protected Browser Actions
Protected actions include:
1. purchase
2. payment
3. refund
4. publish
5. send outbound message
6. delete
7. change settings
8. change permissions
9. submit financial/legal/account-impacting forms
10. Shopify write
11. Stripe money movement
12. Vercel env change
13. Supabase schema change
14. account login bypass
15. MFA/CAPTCHA bypass

## Shared Browser Tool Envelope
All browser MCP tools must return:

```json
{
  "tool": "tool_name",
  "status": "ok | blocked | needs_human | error",
  "phaseStep": "PHASE-X / STEP-Y",
  "timestamp": "ISO-8601",
  "classification": "SAFE_PACKET_ONLY | SAFE_STATUS_READ | SAFE_ROUTE_VALIDATION_REQUEST | SAFE_SCREENSHOT_REQUEST | SAFE_TEXT_EXTRACTION_REQUEST | SAFE_RECEIPT_ONLY | APPROVAL_REQUIRED | BLOCKED_PROTECTED_BROWSER_ACTION",
  "governance": {
    "mutationPerformed": false,
    "browserSessionCreated": false,
    "protectedActionRequested": false,
    "approvalRequired": false,
    "approvalStatus": "not_required | required | approved | blocked"
  },
  "result": {},
  "verified": [],
  "inferred": [],
  "couldNotVerify": [],
  "blockers": [],
  "workarounds": [],
  "selfHeal": [],
  "nextStep": "exact next governed step"
}
```

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
  "receiptRequired": true,
  "createdAt": "ISO-8601"
}
```

## Browser Receipt Envelope

```json
{
  "receiptId": "stable ID",
  "browserTaskId": "stable ID",
  "receiptType": "browser_task | screenshot | text_extraction | route_validation | blocker",
  "phaseStep": "PHASE-X / STEP-Y",
  "actor": "AUTO_BUILDER_GPT_MCP",
  "source": "Browser Agent Bridge",
  "taskType": "validate_route | screenshot | extract_text | inspect_dashboard | governed_step",
  "targetUrl": "https://example.com",
  "status": "ok | blocked | needs_human | failed",
  "mutationPerformed": false,
  "browserSessionCreated": false,
  "protectedActionRequested": false,
  "approvalRequired": false,
  "screenshot": {
    "captured": false,
    "storage": "future URL or null",
    "hash": "optional or null",
    "width": null,
    "height": null
  },
  "logs": [],
  "extractedText": null,
  "verified": [],
  "inferred": [],
  "couldNotVerify": [],
  "blockers": [],
  "workarounds": [],
  "selfHeal": [],
  "nextInstruction": "copyable NEXT GPT INSTRUCTION",
  "createdAt": "ISO-8601"
}
```

## Worker Response Contract

```json
{
  "browserTaskId": "stable ID",
  "workerId": "worker identifier",
  "status": "accepted | running | completed | blocked | failed | needs_human",
  "startedAt": "ISO-8601 or null",
  "completedAt": "ISO-8601 or null",
  "result": {},
  "screenshots": [],
  "logs": [],
  "errors": [],
  "receiptId": "receipt ID or null"
}
```

## Queue-State Transitions
1. `planned`
2. `queued`
3. `running`
4. `blocked`
5. `needs_human`
6. `completed`
7. `failed`
8. `dead_letter`

Allowed transitions:
1. planned -> queued
2. queued -> running
3. running -> completed
4. running -> blocked
5. running -> needs_human
6. running -> failed
7. failed -> queued only when retry limit allows
8. blocked -> dead_letter after self-heal fails
9. needs_human -> queued only after explicit approval

## Screenshot Metadata Structure

```json
{
  "screenshotId": "stable ID",
  "browserTaskId": "stable ID",
  "targetUrl": "https://example.com",
  "capturedAt": "ISO-8601",
  "storage": "future Drive/Supabase/object-storage URL",
  "hash": "optional content hash",
  "width": 0,
  "height": 0,
  "redactionsApplied": false,
  "sensitiveDataRisk": "low | medium | high | unknown"
}
```

## Log Structure

```json
{
  "logId": "stable ID",
  "browserTaskId": "stable ID",
  "level": "info | warn | error | blocker",
  "message": "log message",
  "timestamp": "ISO-8601",
  "metadata": {}
}
```

## Retry / Backoff Policy
1. Maximum retries: 3.
2. Retry delays: 1 minute, 5 minutes, 15 minutes.
3. Stop immediately on protected-action conflict.
4. Stop immediately on login/MFA/CAPTCHA block.
5. Stop immediately if target domain is outside allowed domains.
6. Preserve blocker receipt on failure.
7. Escalate to HUMAN NEEDED after exhausted retries.

## Tool Contract: create_browser_task_packet
Purpose: Create a governed browser task packet without execution.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "phaseStep": { "type": "string" },
    "taskType": { "type": "string" },
    "mode": { "type": "string", "enum": ["headless", "headful"] },
    "targetUrl": { "type": "string" },
    "allowedDomains": { "type": "array", "items": { "type": "string" } },
    "instructions": { "type": "string" },
    "requiresLogin": { "type": "boolean" },
    "protectedActionExpected": { "type": "boolean" }
  },
  "required": ["phaseStep", "taskType", "mode", "targetUrl", "instructions"],
  "additionalProperties": true
}
```

Output: Browser Tool Envelope with `browserTaskPacket` in result.

## Tool Contract: get_browser_task_status
Purpose: Return browser task status from known packet or future queue state. Layer-1 may return planned status only.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "browserTaskId": { "type": "string" }
  },
  "required": ["browserTaskId"],
  "additionalProperties": false
}
```

Output: Browser Tool Envelope with queue state in result.

## Tool Contract: validate_browser_route
Purpose: Create a route-validation request packet. It does not execute browser navigation in this layer.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "phaseStep": { "type": "string" },
    "targetUrl": { "type": "string" },
    "expectedStatus": { "type": "number" },
    "expectedText": { "type": "string" },
    "allowedDomains": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["phaseStep", "targetUrl"],
  "additionalProperties": true
}
```

Output: Browser Tool Envelope with validation request packet in result.

## Tool Contract: request_browser_screenshot
Purpose: Create a screenshot request packet. It does not capture screenshots in this layer.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "phaseStep": { "type": "string" },
    "targetUrl": { "type": "string" },
    "mode": { "type": "string", "enum": ["headless", "headful"] },
    "allowedDomains": { "type": "array", "items": { "type": "string" } },
    "fullPage": { "type": "boolean" }
  },
  "required": ["phaseStep", "targetUrl"],
  "additionalProperties": true
}
```

Output: Browser Tool Envelope with screenshot request packet in result.

## Tool Contract: extract_browser_page_text
Purpose: Create a page-text extraction request packet. It does not execute browser navigation in this layer.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "phaseStep": { "type": "string" },
    "targetUrl": { "type": "string" },
    "allowedDomains": { "type": "array", "items": { "type": "string" } },
    "selector": { "type": "string" }
  },
  "required": ["phaseStep", "targetUrl"],
  "additionalProperties": true
}
```

Output: Browser Tool Envelope with extraction request packet in result.

## Tool Contract: record_browser_execution_receipt
Purpose: Create a browser execution receipt from a worker response or blocked task.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "phaseStep": { "type": "string" },
    "browserTaskId": { "type": "string" },
    "taskType": { "type": "string" },
    "targetUrl": { "type": "string" },
    "status": { "type": "string" },
    "workerResponse": { "type": "object" },
    "blockers": { "type": "array", "items": { "type": "string" } },
    "workarounds": { "type": "array", "items": { "type": "string" } },
    "nextInstruction": { "type": "string" }
  },
  "required": ["phaseStep", "browserTaskId", "taskType", "targetUrl", "status"],
  "additionalProperties": true
}
```

Output: Browser Tool Envelope with browser receipt in result.

## Implementation Boundaries
1. Do not install Playwright in this contract phase.
2. Do not execute browser sessions in this contract phase.
3. Do not write queue records in this contract phase.
4. Do not store screenshots in this contract phase.
5. Do not perform protected browser actions.
6. Do not bypass login, MFA, CAPTCHA, paywalls, or platform controls.

## Future Implementation Order
1. Implement browser ID helpers.
2. Implement browser governance classifier.
3. Implement browser packet helper.
4. Implement browser receipt helper.
5. Register MCP task-packet tools.
6. Add queue persistence only after schema approval.
7. Add Playwright worker only after packet/receipt validation.
8. Add approval-gated protected browser actions last.

## Completion Criteria
Browser MCP contracts are ready when:
1. All first browser tools have schemas.
2. All tools return shared envelopes.
3. Protected browser actions classify correctly.
4. Receipts include screenshots/log placeholders.
5. Queue transitions are defined.
6. No live browser action is required to validate contract correctness.
