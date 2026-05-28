# SOL Blocker Bridge Plan

Project: SOL Persistent Live Avatar Assistant v1
Mode: governed bridge for unavailable runtime connectors and execution blockers

## Purpose
Create a practical bridge between the completed AUTO BUILDER intake package and the blocked runtime execution surfaces.

## Current Blockers
- Vercel execution connector is not callable from this chat runtime.
- Supabase execution connector is not callable from this chat runtime.
- Shopify execution connector is not callable from this chat runtime.
- Social publishing connectors are not callable from this chat runtime.
- AUTO BUILDER orchestration runtime is not callable from this chat runtime.
- HeyGen streaming activation has not been verified from this chat runtime.
- XLSX artifact upload was not completed through this GitHub file path.

## Bridge Strategy
Use GitHub as the canonical handoff bridge. AUTO BUILDER and AUTO BUILDER 2 should ingest this repo folder and execute the next actions from an environment where the required connectors are available.

## Bridge Actions
1. Read MASTER_INDEX.md.
2. Read FINAL_OPERATOR_HANDOFF.md.
3. Read EXECUTIVE_DEPLOYMENT_SUMMARY.md.
4. Read IMPLEMENTATION_BACKLOG.md.
5. Read STAGING_EXECUTION_QUEUE.md.
6. Confirm destination branch and staging environment.
7. Pull the corrected SOL app package from artifact storage or recreate from documented patches.
8. Run sandbox build validation.
9. Execute staging-only connector actions.
10. Log all results in EXECUTION_LEDGER.md.

## Runtime Connector Bridges

### Vercel Bridge
- Use GitHub staging branch as Vercel import source.
- Configure preview deployment only.
- Add 5-minute cron after preview health route passes.
- Record preview URL, deployment ID, and cron logs.

### Supabase Bridge
- Use staging project only.
- Review supabase.sql before execution.
- Apply migration in staging.
- Validate RLS.
- Record schema state and rollback checkpoint.

### Shopify Bridge
- Draft only until staging and approval gates pass.
- Do not change live store without explicit approval.
- Use product copy and business plan docs as source.

### OpenAI Bridge
- Configure OPENAI_API_KEY only in staging secrets.
- Validate chat route.
- Validate policy gate.
- Record model, route result, and error state.

### HeyGen Bridge
- Confirm avatar readiness.
- Confirm voice ID.
- Confirm video and streaming entitlement.
- Run one short staging validation only.
- Pause before repeated generation.

### Social Systems Bridge
- Draft calendars and workflows only.
- Do not publish or schedule without explicit approval.
- Validate platform-safe content rules.

## Evidence Required
Every bridged execution must record:
- Timestamp UTC
- System touched
- Environment
- Branch or deployment ID
- Commit SHA
- Result
- Blocker
- Workaround
- Rollback path
- Approval state

## Stop Conditions
Stop bridge execution if:
- Runtime target is ambiguous.
- Approval evidence is missing.
- Production target is selected before preview passes.
- Secrets are exposed.
- RLS validation fails.
- Rollback path is missing.
- Connector behavior differs from expected docs.
