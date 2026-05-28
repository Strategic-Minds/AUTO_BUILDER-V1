# SOL Staging Execution Checklist

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Mode: staging first, governed execution

## 1. Staging Branch Setup
- Confirm default branch is main.
- Create staging branch for SOL work.
- Confirm no production branch is modified directly.
- Record branch name and base commit in EXECUTION_LEDGER.md.

## 2. Package Intake
- Locate corrected SOL app package.
- Import files into staging branch.
- Confirm required folders exist: app, components, lib, docs.
- Confirm package.json, tsconfig.json, next.config.mjs, README.md, .env.example, and supabase.sql exist.

## 3. Environment Variable Verification
Required staging variables:
- OPENAI_API_KEY
- OPENAI_MODEL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- HEYGEN_API_KEY
- HEYGEN_SOL_AVATAR_ID
- HEYGEN_SOL_VOICE_ID
- SOL_READ_ONLY_MODE=true
- SOL_REQUIRE_APPROVALS=true
- APP_BASE_URL

Validation:
- Confirm keys are stored only in staging secrets.
- Confirm no secret values are committed.
- Confirm service role key is server-only.
- Record validation result in EXECUTION_LEDGER.md.

## 4. OpenAI Route Testing
- Confirm health route loads first.
- Test chat route with a short safe message.
- Test blocked request handling.
- Confirm client supplied system messages are ignored.
- Confirm history limit is enforced.
- Confirm errors return structured response.

## 5. Supabase Staging Checks
- Confirm staging project exists.
- Review SQL before execution.
- Run SQL only in staging.
- Confirm tables exist.
- Confirm RLS is enabled.
- Confirm authenticated select and insert policies work.
- Confirm service role is not exposed to client.
- Record rollback notes.

## 6. HeyGen Readiness Verification
- Confirm SOL avatar status is ready.
- Confirm SOL voice ID is valid.
- Confirm video generation entitlement.
- Confirm streaming entitlement separately if live avatar mode is needed.
- Run only one short staging test first.
- Record output status, cost impact, and result.

## 7. Rollback Checkpoints
- Capture branch base commit.
- Capture database pre-change state.
- Document env variable changes.
- Confirm route to disable workflows.
- Confirm route to revert staging branch.

## 8. Evidence Logging Requirements
Every staged action must log:
- Timestamp UTC
- Phase and step
- System touched
- Action taken
- Result
- Blocker
- Workaround
- Rollback path
- Evidence link or commit SHA

## 9. Stop Conditions
Pause and request human approval before:
- Production deployment
- Production SQL
- Billing change
- Shopify live change
- Public social posting
- Bulk outbound messaging
- Destructive rollback
