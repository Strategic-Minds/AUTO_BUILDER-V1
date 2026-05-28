# SOL Preview Deploy Validation

Project: SOL Persistent Live Avatar Assistant v1
Environment: staging and preview only

## Objective
Validate preview deployment before any production action.

## 1. Preview Deployment Validation
- Confirm preview deployment completed successfully.
- Confirm deployment URL is reachable.
- Confirm no production environment variables are attached.
- Record preview URL and deployment timestamp.

## 2. Health Route Validation
- Open /api/health.
- Confirm JSON response returns ok=true.
- Confirm no stack trace or secret exposure.
- Record response result.

## 3. OpenAI Route Validation
- Send safe chat message.
- Confirm assistant reply returns.
- Send blocked request example.
- Confirm policy gate response blocks correctly.
- Confirm structured error handling works.
- Confirm no client override of system prompt.

## 4. Supabase Validation
- Confirm staging database only.
- Confirm tables exist.
- Confirm RLS enabled.
- Confirm authenticated access works.
- Confirm unauthorized access is denied.
- Confirm service role is not exposed in browser.

## 5. HeyGen Validation
- Confirm SOL avatar is ready.
- Confirm SOL voice ID is valid.
- Confirm one short test generation works.
- Confirm result logs successfully.
- Pause before repeated generation.

## 6. Approval Gate Validation
- Confirm SOL_READ_ONLY_MODE=true.
- Confirm SOL_REQUIRE_APPROVALS=true.
- Confirm restricted actions pause correctly.
- Confirm approval events log correctly.

## 7. Rollback Validation
- Confirm rollback branch exists.
- Confirm prior commit can be restored.
- Confirm staging database snapshot exists.
- Confirm scheduled jobs can be paused.
- Confirm rollback events are logged.

## 8. Evidence Requirements
Record:
- Preview URL
- Commit SHA
- Validation timestamp
- Test result
- Blockers
- Workarounds
- Rollback path
- Approval state

## 9. Production Stop Gate
Do not proceed to production until:
- Preview checks pass.
- Approval checkpoints pass.
- Rollback path verified.
- Human approval captured.
