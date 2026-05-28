# SOL Governed Autonomy Matrix

Project: SOL Persistent Live Avatar Assistant v1
Mode: governed staging first autonomy

## Purpose
Define what AUTO BUILDER, AUTO BUILDER 2, and SOL may do autonomously, what requires approval, and what is forbidden.

## Allowed Autonomous Actions
These actions may run without additional approval when scoped to sandbox or read only staging review:

- Read repo docs and prior execution ledger entries.
- Generate plans, drafts, checklists, and reports.
- Run disposable sandbox install, type, lint, and build checks.
- Validate environment variable names without exposing values.
- Test health routes in preview.
- Test policy gate behavior with safe examples.
- Draft Supabase SQL for review.
- Draft Shopify, social, Xyla, and Opus workflows without publishing.
- Record evidence in execution ledger.

## Approval Required Actions
These actions require logged approval before execution:

- Creating or changing staging branches that affect build flow.
- Executing Supabase staging SQL.
- Creating Vercel preview deployments.
- Running OpenAI route tests that use paid API calls beyond minimal validation.
- Running HeyGen video or streaming tests.
- Changing Shopify live configuration or catalog data.
- Scheduling or publishing social content.
- Sending outbound messages through Gmail, Slack, or social platforms.
- Promoting staging to production.
- Rotating or adding production secrets.

## Forbidden Actions Without Explicit Approval
These actions must not run without explicit current approval and rollback evidence:

- Production deployment.
- Production SQL execution.
- Destructive database changes.
- Billing or payment changes.
- Public posting or mass scheduling.
- Bulk outbound messaging.
- Removing rollback checkpoints.
- Exposing secrets in logs, docs, commits, screenshots, or chat.
- Bypassing policy gates or approval gates.

## Staging Isolation Rules
- Use staging keys and staging projects only.
- Never use production database URLs in sandbox.
- Never attach production Shopify, social, or payment surfaces to test runs.
- Keep SOL_READ_ONLY_MODE enabled unless approved action scope says otherwise.
- Keep SOL_REQUIRE_APPROVALS enabled.
- Log branch, commit, environment, and evidence for every action.

## Runtime Ownership Boundaries
| Surface | Owner | Autonomous Scope | Approval Gate |
|---|---|---|---|
| GitHub | AUTO BUILDER | Docs, staging files, checks | Production branch changes |
| Vercel | AUTO BUILDER 2 | Preview checks | Production deploy |
| Supabase | AUTO BUILDER 2 | SQL draft, staging validation | Staging SQL and production SQL |
| OpenAI | SOL runtime | Safe chat route tests | Cost or production use |
| HeyGen | SOL avatar layer | Readiness checks | Video generation and streaming |
| Shopify | Commerce operator | Draft plans and copy | Live store changes |
| Google Workspace | Ops operator | Read and draft workflows | Sending or changing canon |
| Xyla | Content automation | Draft workflow specs | Live automation |
| Opus | Content automation | Draft workflow specs | Live automation |
| Social systems | Distribution operator | Draft calendars | Publishing or scheduling |

## Escalation Rule
When in doubt, pause and request approval. Do not infer approval for production, billing, public publishing, destructive data actions, or mass outbound communication.
