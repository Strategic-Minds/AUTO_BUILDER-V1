# SOL Incident Response Playbook

Project: SOL Persistent Live Avatar Assistant v1
Environment: sandbox, staging, preview, and production governance

## Purpose
Define the incident handling process for SOL runtime, deployment, workflow, database, OpenAI, HeyGen, and automation failures.

## Incident Severity Levels

### Severity 0 - Informational
- No service impact.
- Logging or cosmetic issue only.
- No rollback required.

### Severity 1 - Minor
- Limited staging issue.
- Build or validation warning.
- No production outage.
- Sandbox recovery acceptable.

### Severity 2 - Moderate
- Preview deployment instability.
- OpenAI route instability.
- Policy gate malfunction.
- Non-destructive staging database issue.
- Requires coordinated recovery.

### Severity 3 - Major
- Production instability.
- Authentication or RLS failure.
- Secret exposure risk.
- Workflow or automation failure affecting operations.
- Requires rollback readiness review.

### Severity 4 - Critical
- Production data risk.
- Destructive SQL.
- Uncontrolled public automation.
- Security compromise.
- Billing escalation or runaway cost event.
- Immediate containment required.

## Incident Response Flow
1. Detect and classify incident.
2. Pause risky automation.
3. Preserve evidence.
4. Identify affected systems.
5. Confirm rollback path.
6. Apply smallest safe containment.
7. Validate recovery.
8. Log final state and lessons learned.

## Escalation Paths
Escalate immediately for:
- Production outage.
- Secret exposure.
- Failed rollback.
- Billing escalation.
- Public automation malfunction.
- Unsafe OpenAI or HeyGen output.
- Authentication or RLS bypass.

## Rollback Authority
- Sandbox rollback may proceed after evidence capture.
- Staging rollback may proceed after operator review.
- Production rollback requires explicit approval unless immediate containment is required to stop active damage.
- All rollback events must be logged.

## Outage Handling
During outage:
- Pause scheduled workflows.
- Pause public automation.
- Preserve logs.
- Capture deployment identifiers.
- Capture branch and commit state.
- Preserve database snapshots if possible.
- Validate recovery before resuming automation.

## Audit Logging Requirements
Every incident entry must record:
- Timestamp UTC
- Severity level
- Environment
- Systems affected
- Trigger
- Containment action
- Rollback path
- Recovery result
- Remaining risks
- Approval state
- Evidence references

## Post-Incident Validation Requirements
Before closing an incident:
- Confirm affected routes recover.
- Confirm rollback or recovery succeeded.
- Confirm policy gates work.
- Confirm audit logging continues.
- Confirm secrets remain protected.
- Confirm workflows remain paused or safely resumed.
- Update EXECUTION_LEDGER.md.
- Add lessons learned if process changes are required.

## Production Stop Conditions
Do not resume production automation when:
- Root cause is unknown.
- Rollback path is missing.
- Approval evidence is missing.
- Secret exposure remains unresolved.
- RLS or auth failure remains unresolved.
- Audit logging is incomplete.
- Validation checks are failing.
