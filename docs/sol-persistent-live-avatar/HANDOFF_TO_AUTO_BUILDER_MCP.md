# SOL Handoff Instructions

## Intake Target
Repository: Strategic-Minds/AUTO_BUILDER
Folder: docs/sol-persistent-live-avatar

## Objective
AUTO BUILDER and AUTO BUILDER 2 should ingest this folder as the governed intake packet for SOL Persistent Live Avatar Assistant v1.

## Required Actions
1. Read build packet.
2. Validate governance constraints.
3. Create staging branch.
4. Run sandbox build validation.
5. Validate OpenAI configuration.
6. Validate HeyGen avatar readiness.
7. Validate Supabase staging migration sequence.
8. Generate deployment readiness report.
9. Pause before production mutation.

## Governance Constraints
- No irreversible billing actions.
- No production deployment without approval.
- No destructive SQL.
- No public social posting without approval.
- Log every mutation and rollback event.

## Success Criteria
- Build passes.
- Policy gates pass.
- RLS validation passes.
- Approval checkpoints recorded.
- Rollback path verified.
