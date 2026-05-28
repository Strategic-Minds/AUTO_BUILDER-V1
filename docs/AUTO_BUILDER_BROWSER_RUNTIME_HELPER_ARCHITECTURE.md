# AUTO BUILDER BROWSER RUNTIME HELPER ARCHITECTURE

## Purpose
Define implementation architecture for Browser Agent Bridge runtime helpers. These helpers prepare future Browser MCP tool implementation without installing Playwright, executing browser sessions, mutating external systems, or bypassing approval gates.

## Current System State
AUTO BUILDER contains:
1. Hardened governance spine.
2. Recursive continuity architecture.
3. Operational workflow tree.
4. Validation architecture.
5. GPT MCP connected bridge.
6. MCP executor expansion roadmap.
7. Layer-1/Layer-2 executor contracts.
8. MCP helper implementation architecture.
9. Browser Agent Bridge architecture.
10. Browser MCP tool contracts.
11. GPT Workbook Library Repo / GPT Intelligence Data Center.

## Recommended File Structure

```text
src/lib/autobuilder/browser/
  browser-envelope.ts
  browser-governance.ts
  browser-packets.ts
  browser-receipts.ts
  browser-queue.ts
  browser-status.ts
  browser-ids.ts
  index.ts
```

## Runtime Dependency Boundaries
1. Browser helper modules must not import Playwright.
2. Browser helper modules must not create browser sessions.
3. Browser helper modules must not write to Supabase, Drive, Sheets, Shopify, Stripe, Vercel, or account settings.
4. Browser helper modules may create structured packets, statuses, receipts, IDs, classifications, and normalized worker responses.
5. Browser execution belongs to a future worker layer, not these helpers.

## browser-envelope.ts
Purpose: Normalize all Browser MCP tool responses.

Exports:
1. `BrowserToolStatus`
2. `BrowserGovernanceClassification`
3. `BrowserApprovalStatus`
4. `BrowserGovernanceEnvelope`
5. `BrowserToolEnvelope<T>`
6. `createBrowserEnvelope<T>()`

Core Types:

```ts
export type BrowserToolStatus = "ok" | "blocked" | "needs_human" | "error";

export type BrowserGovernanceClassification =
  | "SAFE_PACKET_ONLY"
  | "SAFE_STATUS_READ"
  | "SAFE_ROUTE_VALIDATION_REQUEST"
  | "SAFE_SCREENSHOT_REQUEST"
  | "SAFE_TEXT_EXTRACTION_REQUEST"
  | "SAFE_RECEIPT_ONLY"
  | "APPROVAL_REQUIRED"
  | "BLOCKED_PROTECTED_BROWSER_ACTION";

export type BrowserApprovalStatus = "not_required" | "required" | "approved" | "blocked";

export type BrowserGovernanceEnvelope = {
  mutationPerformed: false;
  browserSessionCreated: false;
  protectedActionRequested: boolean;
  approvalRequired: boolean;
  approvalStatus: BrowserApprovalStatus;
};

export type BrowserToolEnvelope<T> = {
  tool: string;
  status: BrowserToolStatus;
  phaseStep: string;
  timestamp: string;
  classification: BrowserGovernanceClassification;
  governance: BrowserGovernanceEnvelope;
  result: T;
  verified: string[];
  inferred: string[];
  couldNotVerify: string[];
  blockers: string[];
  workarounds: string[];
  selfHeal: string[];
  nextStep: string;
};
```

## browser-governance.ts
Purpose: Classify browser tasks before execution.

Exports:
1. `PROTECTED_BROWSER_KEYWORDS`
2. `classifyBrowserTask()`
3. `isAllowedDomain()`
4. `normalizeAllowedDomains()`

Protected Keywords:
1. purchase
2. payment
3. refund
4. publish
5. send
6. delete
7. setting
8. permission
9. submit
10. shopify write
11. stripe money
12. vercel env
13. supabase schema
14. login bypass
15. mfa bypass
16. captcha bypass

Governance Failure Behavior:
1. Protected action without explicit approval returns `BLOCKED_PROTECTED_BROWSER_ACTION`.
2. Unknown or missing allowed domain returns `APPROVAL_REQUIRED` or `blocked` depending risk.
3. Login/MFA/CAPTCHA bypass requests always return `BLOCKED_PROTECTED_BROWSER_ACTION`.
4. Any mutation intent in Layer-1/Layer-2 must be blocked or approval-required.

## browser-ids.ts
Purpose: Generate deterministic IDs for packets, receipts, screenshots, logs, and idempotency keys.

Exports:
1. `createBrowserTaskId()`
2. `createBrowserReceiptId()`
3. `createScreenshotId()`
4. `createBrowserLogId()`
5. `createBrowserIdempotencyKey()`

Idempotency Strategy:
1. Normalize phaseStep, taskType, targetUrl, mode, and instructions.
2. Create stable slug/hash-like IDs from normalized fields.
3. Include timestamp only where uniqueness is required.
4. Use idempotency key to prevent duplicate execution in future worker layer.

## browser-packets.ts
Purpose: Create browser task packets without execution.

Exports:
1. `BrowserTaskType`
2. `BrowserMode`
3. `BrowserTaskPacket`
4. `createBrowserTaskPacket()`
5. `createRouteValidationPacket()`
6. `createScreenshotRequestPacket()`
7. `createTextExtractionPacket()`

Responsibilities:
1. Normalize target URL.
2. Normalize allowed domains.
3. Classify governance.
4. Create packet ID.
5. Create idempotency key.
6. Return packet only.
7. Never execute browser action.

## browser-receipts.ts
Purpose: Create browser receipts from packets, blocked tasks, or future worker responses.

Exports:
1. `BrowserReceiptType`
2. `BrowserReceipt`
3. `ScreenshotMetadata`
4. `BrowserLogEntry`
5. `createBrowserReceipt()`
6. `createScreenshotMetadata()`
7. `createBrowserLogEntry()`

Receipt Rules:
1. `mutationPerformed` must remain false for Layer-1/Layer-2.
2. `browserSessionCreated` must remain false for Layer-1/Layer-2.
3. Receipts must include blockers, workarounds, selfHeal, and nextInstruction.
4. Screenshots/logs are metadata placeholders until worker implementation.

## browser-queue.ts
Purpose: Normalize queue-state transitions without writing to a queue.

Exports:
1. `BrowserQueueStatus`
2. `BrowserApprovalState`
3. `BrowserQueueItem`
4. `normalizeBrowserQueueState()`
5. `isAllowedBrowserQueueTransition()`
6. `createPlannedBrowserQueueItem()`

Queue States:
1. planned
2. queued
3. running
4. blocked
5. needs_human
6. completed
7. failed
8. dead_letter

Allowed Transitions:
1. planned -> queued
2. queued -> running
3. running -> completed
4. running -> blocked
5. running -> needs_human
6. running -> failed
7. failed -> queued when retry limit allows
8. blocked -> dead_letter after self-heal fails
9. needs_human -> queued only after explicit approval

## browser-status.ts
Purpose: Normalize browser task status and future worker responses.

Exports:
1. `BrowserWorkerStatus`
2. `BrowserWorkerResponse`
3. `normalizeWorkerResponse()`
4. `createBrowserTaskStatus()`
5. `createBlockedBrowserStatus()`

Worker Response Normalization:
1. Convert missing timestamps to null.
2. Normalize screenshots to array.
3. Normalize logs to array.
4. Normalize errors to array.
5. Preserve receiptId if provided.
6. Never infer completion without worker evidence.

## Import Structure
Future MCP browser tools should import:

```ts
import {
  createBrowserEnvelope,
  classifyBrowserTask,
  createBrowserTaskPacket,
  createBrowserReceipt,
  createPlannedBrowserQueueItem,
  createBrowserTaskStatus,
  normalizeWorkerResponse
} from "@/lib/autobuilder/browser";
```

## Error Handling Strategy
1. Invalid URL returns `blocked` with blocker reason.
2. Domain mismatch returns `blocked` or `needs_human` based on risk.
3. Protected action returns `blocked`.
4. Missing phaseStep returns `error`.
5. Missing taskType returns `error`.
6. Worker response without proof remains `Could Not Verify`.
7. All errors must preserve nextStep and final continuity guidance.

## Screenshot Metadata Helper Structure
Screenshot metadata must include:
1. screenshotId
2. browserTaskId
3. targetUrl
4. capturedAt
5. storage
6. hash
7. width
8. height
9. redactionsApplied
10. sensitiveDataRisk

Layer-1/Layer-2 must set captured false or storage null unless a future worker provides actual evidence.

## Governance-Failure Behavior
1. Return envelope status `blocked` for protected browser actions.
2. Set approvalStatus `blocked` or `required`.
3. Set protectedActionRequested true.
4. Add blocker explanation.
5. Add workaround.
6. Add nextStep for approval or safe alternative.
7. Do not execute browser task.

## Runtime Organization
First implementation should only add helper files. MCP route registration should occur after helpers compile and contracts are verified.

Recommended order:
1. `browser-envelope.ts`
2. `browser-ids.ts`
3. `browser-governance.ts`
4. `browser-packets.ts`
5. `browser-receipts.ts`
6. `browser-queue.ts`
7. `browser-status.ts`
8. `index.ts`
9. MCP tool registration in `/api/mcp`

## Validation Plan
1. TypeScript build passes.
2. Helpers do not import Playwright.
3. Helpers do not write external systems.
4. Protected browser actions classify correctly.
5. Packets include stable IDs and idempotency keys.
6. Receipts include continuity fields.
7. Queue transitions normalize correctly.
8. Worker responses do not claim success without evidence.

## Future Implementation Boundary
Do not install Playwright or execute live browser actions until:
1. Browser helper implementation passes build.
2. MCP browser task-packet tools register successfully.
3. Receipt format is validated.
4. Queue persistence is approved.
5. Worker runtime is approved.
6. Protected action approval gate is validated.
