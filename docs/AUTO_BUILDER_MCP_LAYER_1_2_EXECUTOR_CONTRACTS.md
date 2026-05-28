# AUTO BUILDER MCP LAYER 1 AND 2 EXECUTOR CONTRACTS

## Purpose
Define the first governed MCP executor implementation package for AUTO BUILDER. Layer-1 and Layer-2 tools must remain read-only or receipt-producing only. They must not perform protected live mutations.

## Current MCP Status
CONNECTED / HIGH-CAPABILITY / GOVERNED PLANNING + BLUEPRINT MCP.

## Target For This Package
Prepare implementation readiness for:
1. `get_live_stack_status`
2. `get_workflow_state`
3. `create_continuity_receipt`
4. `create_execution_receipt`
5. `create_recursive_next_step`

## Governance Boundary
No workflow, governance, source-truth, billing, deployment, database, Drive canon, Sheets canon, Shopify, Stripe money movement, Vercel env, Supabase schema, connector, or authority-file mutation is allowed unless Jeremy explicitly commands that exact mutation in the current session.

Layer-1 and Layer-2 tools must not mutate external systems. They may only return structured status or structured receipts.

## Shared Output Envelope
All tools must return:

```json
{
  "tool": "tool_name",
  "status": "ok | blocked | needs_human | error",
  "phaseStep": "PHASE-X / STEP-Y",
  "timestamp": "ISO-8601",
  "verified": [],
  "inferred": [],
  "couldNotVerify": [],
  "governance": {
    "mutationPerformed": false,
    "protectedMutationRequested": false,
    "approvalRequired": false,
    "approvalStatus": "not_required | required | approved | blocked"
  },
  "result": {},
  "blockers": [],
  "workarounds": [],
  "selfHeal": [],
  "nextStep": "exact next governed step"
}
```

## Shared Receipt Structure
All receipt-producing tools must include:

```json
{
  "receiptId": "auto-generated stable ID",
  "receiptType": "continuity | execution | validation | blocker | recursive_next_step",
  "phaseStep": "PHASE-X / STEP-Y",
  "actor": "AUTO_BUILDER_GPT_MCP",
  "source": "GPT MCP",
  "action": "action name",
  "targetSystem": "system name",
  "mutationPerformed": false,
  "protectedMutationRequested": false,
  "approvalRequired": false,
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

## Tool Contract: get_live_stack_status
Purpose: Return current known AUTO BUILDER stack status without mutation.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "includeRoutes": { "type": "boolean" },
    "includeGovernance": { "type": "boolean" },
    "includeConnectors": { "type": "boolean" }
  },
  "additionalProperties": false
}
```

Output Result Fields:
1. `stack`
2. `connectedSurfaces`
3. `knownRoutes`
4. `governanceState`
5. `mcpStatus`
6. `executorMaturity`

Rules:
1. Read-only only.
2. No secrets.
3. No live connector mutation.
4. Must label unverified live surfaces as Could Not Verify.

## Tool Contract: get_workflow_state
Purpose: Return current workflow state, phase, step, readiness, and next governed action.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "currentPhaseStep": { "type": "string" },
    "objective": { "type": "string" },
    "lastKnownBlocker": { "type": "string" }
  },
  "additionalProperties": true
}
```

Output Result Fields:
1. `currentPhaseStep`
2. `workflowLane`
3. `readinessStatus`
4. `nextGovernedAction`
5. `humanNeeded`
6. `dehydrateRequired`

Rules:
1. Must preserve PHASE-X / STEP-Y.
2. Must not advance phase without evidence.
3. Must mark unclear state as Could Not Verify.

## Tool Contract: create_continuity_receipt
Purpose: Produce a structured continuity receipt for rehydrate/dehydrate continuity.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "phaseStep": { "type": "string" },
    "summary": { "type": "string" },
    "sourcesChecked": { "type": "array", "items": { "type": "string" } },
    "blockers": { "type": "array", "items": { "type": "string" } },
    "nextInstruction": { "type": "string" }
  },
  "required": ["phaseStep", "summary", "nextInstruction"],
  "additionalProperties": true
}
```

Rules:
1. Receipt only.
2. No external persistence in Layer-2.
3. Persistence can be added later through approved Layer-3 tools.

## Tool Contract: create_execution_receipt
Purpose: Produce a structured receipt for an executed or attempted action.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "phaseStep": { "type": "string" },
    "action": { "type": "string" },
    "targetSystem": { "type": "string" },
    "result": { "type": "string" },
    "mutationPerformed": { "type": "boolean" },
    "blockers": { "type": "array", "items": { "type": "string" } },
    "workarounds": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["phaseStep", "action", "targetSystem", "result"],
  "additionalProperties": true
}
```

Rules:
1. If `mutationPerformed` is true, tool must return `blocked` for Layer-2 unless explicit approved metadata exists.
2. Receipt output must not claim unverified success.
3. Protected targets must be flagged.

## Tool Contract: create_recursive_next_step
Purpose: Produce a copyable recursive NEXT GPT INSTRUCTION from the current state.

Input Schema:
```json
{
  "type": "object",
  "properties": {
    "currentPhaseStep": { "type": "string" },
    "objective": { "type": "string" },
    "summary": { "type": "string" },
    "blockers": { "type": "array", "items": { "type": "string" } },
    "humanNeeded": { "type": "boolean" }
  },
  "required": ["currentPhaseStep", "objective", "summary"],
  "additionalProperties": true
}
```

Output Result Fields:
1. `nextInstruction`
2. `humanNeeded`
3. `phaseStep`
4. `governanceReminder`
5. `dehydrateReminder`

Rules:
1. Must be copyable.
2. Must include governance lock.
3. Must include exact next objective.
4. Must include blocker handling.

## Approval-Gate Logic
Layer-1 and Layer-2 tools must classify each call:
1. `SAFE_READ_ONLY`
2. `SAFE_RECEIPT_ONLY`
3. `APPROVAL_REQUIRED`
4. `BLOCKED_PROTECTED_MUTATION`

Protected targets include:
1. billing
2. deployment
3. database
4. Shopify write
5. Stripe money movement
6. Vercel env
7. Supabase schema
8. Drive canon mutation
9. Sheets canon mutation
10. governance/source-truth/authority-file mutation

## Queue-State Structure
Layer-1 and Layer-2 do not execute queue writes, but must define queue state for later layers:

```json
{
  "queueItemId": "stable ID",
  "phaseStep": "PHASE-X / STEP-Y",
  "status": "planned | queued | blocked | approved | executed | failed",
  "approvalState": "not_required | pending | approved | rejected",
  "idempotencyKey": "stable key",
  "targetSystem": "system",
  "action": "action",
  "payload": {},
  "receiptId": "receipt ID",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

## Retry / Backoff Logic
Layer-1 and Layer-2 do not retry live actions. They may recommend retry policy:
1. Maximum retries: 3.
2. Backoff: 1 minute, 5 minutes, 15 minutes.
3. Stop immediately on protected mutation conflict.
4. Escalate after repeated platform failure.
5. Preserve blocker receipt.

## Continuity Persistence Requirements
Layer-1 and Layer-2 return receipts only. Layer-3 will persist receipts to approved storage.

Future persistence targets:
1. Ops Sheet continuity ledger.
2. Supabase telemetry table.
3. Drive receipt packet.
4. GitHub audit artifact when appropriate.

## Implementation Order
1. Implement shared envelope helper.
2. Implement approval classifier.
3. Implement receipt ID generator.
4. Implement `get_live_stack_status`.
5. Implement `get_workflow_state`.
6. Implement `create_continuity_receipt`.
7. Implement `create_execution_receipt`.
8. Implement `create_recursive_next_step`.
9. Validate MCP tool registration.
10. Test each tool with no live writes.

## Completion Criteria
Layer-1 and Layer-2 are ready when:
1. Tools register in GPT MCP.
2. Tools return stable structured envelopes.
3. Receipts include phase, step, source, result, blocker, workaround, self-heal, and next instruction.
4. Protected mutation attempts are blocked.
5. No live writes occur.
