# AUTO BUILDER Execution Ledger Template

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Mode: governed runtime action logging

## Purpose
Standardize logging for all AUTO BUILDER and AUTO BUILDER 2 runtime actions across GitHub, Vercel, Supabase, OpenAI, HeyGen, Shopify, Google Workspace, Xyla, Opus, social systems, cron workflows, and sandbox runs.

## Required Ledger Entry

```md
## ENTRY-[YYYYMMDD-HHMMSS-UTC]

Phase / Step:
Runtime Mode: read-only | sandbox | staging | preview | production
Environment: sandbox | staging | preview | production
Actor:
System Touched:
Connector Used:
Action:
Approval Level:
Approval Evidence:
Branch:
Commit SHA:
Deployment ID:
Cron ID:
Database Target:
Result: pass | fail | blocked | partial
Blocker:
Workaround:
Self-Heal Result:
Rollback Path:
Evidence Reference:
Next Action:
Human Needed: yes | no
```

## Deployment Evidence Format

```md
Deployment Evidence:
- Provider:
- Project:
- Environment:
- Branch:
- Commit SHA:
- Deployment ID:
- URL:
- Build Status:
- Health Route Result:
- Log Reference:
- Rollback Target:
```

## Rollback Evidence Requirements

```md
Rollback Evidence:
- Rollback Trigger:
- Environment:
- Last Known Passing Commit:
- Snapshot or Restore Point:
- Workflow Pause Method:
- Credentials Affected:
- Recovery Owner:
- Validation After Rollback:
- Final State:
```

## Cron Execution Log

```md
Cron Evidence:
- Cron Name:
- Cron Expression:
- Target Route:
- Environment:
- Start Time UTC:
- Last Run UTC:
- Last Status:
- Failure Log:
- Pause Method:
- Rollback Method:
```

## Sandbox Validation Log

```md
Sandbox Evidence:
- Runtime ID:
- Branch:
- Commit SHA:
- Install Result:
- Type Check Result:
- Lint Result:
- Build Result:
- Health Route Result:
- Policy Gate Result:
- OpenAI Route Result:
- Supabase Review Result:
- HeyGen Readiness Result:
- Failure Recovery:
```

## Cross Stack Audit Event

```md
Audit Event:
- Timestamp UTC:
- Source System:
- Target System:
- Action Type:
- Actor:
- Runtime Mode:
- Approval Level:
- Risk Level:
- Result:
- Evidence Reference:
- Rollback Reference:
```

## Logging Rules
- Do not log secret values.
- Log variable names only.
- Log evidence before claiming completion.
- Mark unverifiable claims as Could Not Verify.
- Keep staging and production evidence separate.
- Pause when approval or rollback state is missing.
