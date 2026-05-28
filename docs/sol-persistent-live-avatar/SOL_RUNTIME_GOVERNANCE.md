# SOL Runtime Governance

Project: SOL Persistent Live Avatar Assistant v1
Environment: staging first governed runtime

## Runtime Governance Goals
- Keep SOL stable, safe, and auditable.
- Separate staging from production.
- Preserve approval checkpoints.
- Prevent unsafe automation or uncontrolled mutation.

## Runtime Modes
### Read Only Mode
- Planning and validation only.
- No production writes.
- No public posting.
- No destructive SQL.
- No billing escalation.

### Approved Mutation Mode
- Requires explicit approval evidence.
- Limited to the approved action scope.
- Must log every mutation.
- Must preserve rollback path.

## Approval Logic
Approval is required before:
- Production deploy.
- Production SQL.
- Shopify live edits.
- Public social publishing.
- Bulk outbound messaging.
- Payment or billing changes.
- Repeated cost bearing avatar generation.

## Policy Gate Rules
- Validate requests before OpenAI or HeyGen execution.
- Reject unsafe, out of scope, or policy violating requests.
- Convert risky requests into safe alternatives when possible.
- Log gate decisions and blocker state.

## OpenAI Runtime Controls
- Use approved SOL system prompt.
- Validate request schema.
- Limit request history size.
- Return structured failures.
- Prevent client override of system prompts.
- Prevent secret exposure in responses.

## HeyGen Runtime Controls
- Validate avatar readiness.
- Validate voice mapping.
- Validate API entitlement.
- Limit repeated generation.
- Pause before public scale usage.
- Log generation attempts and outcomes.

## Audit Logging
Every runtime action must capture:
- Timestamp UTC
- Runtime mode
- Environment
- Action
- Result
- Blocker
- Workaround
- Rollback path
- Evidence reference

## Rollback Governance
- Maintain staging snapshots.
- Keep rollback commits accessible.
- Pause automation before rollback.
- Log rollback authority and evidence.
- Require approval for destructive production rollback.

## Production Stop Conditions
Do not proceed when:
- Approval evidence is missing.
- RLS validation is incomplete.
- Secrets are exposed.
- Preview deployment fails.
- Policy gate is bypassed.
- Rollback path is missing.
- Runtime logging is incomplete.
