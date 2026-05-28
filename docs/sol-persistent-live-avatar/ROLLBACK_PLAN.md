# SOL Rollback Plan

## Rollback Principles
- Preserve staging snapshots before changes.
- Separate staging from production.
- Log every rollback event.
- Never execute destructive rollback without approval.

## Rollback Triggers
- Failed build validation
- Policy gate failure
- RLS/auth failure
- Unexpected API cost escalation
- Unsafe output generation
- Deployment instability

## Rollback Sequence
1. Pause workflows.
2. Disable scheduled automation.
3. Restore prior repo state.
4. Restore staging database snapshot.
5. Revoke temporary tokens.
6. Re-run validation.
7. Log blocker and self-heal result.

## Evidence Requirements
- Commit SHA
- Snapshot ID
- Environment affected
- Timestamp
- Operator
