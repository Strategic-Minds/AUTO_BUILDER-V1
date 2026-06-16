# AUTO BUILDER Handoff Vercel Workflow

## Current Status

This workflow makes Vercel Workflow the durable owner of the AUTO BUILDER handoff path.

It replaces ad hoc/manual handoff execution with a durable sequence:

1. Check redeploy readiness.
2. Start a governed Vercel preview redeploy.
3. Poll the Vercel deployment until `READY`, `ERROR`, or `CANCELED`.
4. Verify required AUTO BUILDER runtime routes.
5. Write a bridge evidence receipt.
6. Return rollback and next-action metadata.

Production deployment remains approval-gated inside the workflow.

## Repo Target And Branch Plan

- Repo: `Strategic-Minds/AUTO_BUILDER`
- Implementation branch: `auto-builder/vercel-workflow-handoff-20260616`
- Base commit: `4df2ebdd32d805f83b25321bdae9192a425cde58`
- Release strategy: preview-first draft PR, no production promotion until explicit approval.

## Files And Systems Affected

- `src/workflows/auto-builder-handoff-workflow.ts`
  - Durable workflow definition.
  - Runs readiness, redeploy submission, polling, route checks, receipt writing, and production approval wait.
- `src/app/api/workflows/auto-builder-handoff/route.ts`
  - Starts the workflow using `start()` from `workflow/api`.
- `src/app/api/workflows/auto-builder-handoff/run/[runId]/route.ts`
  - Reads workflow run status using `getRun()`.
- `src/app/api/workflows/auto-builder-handoff/readable/[runId]/route.ts`
  - Streams workflow events from `run.getReadable()` as server-sent events.
- `src/app/api/workflows/auto-builder-handoff/approval/route.ts`
  - Resumes the production approval hook using `resumeHook()`.

## Required Environment Variables And Secrets

Required for preview redeploy execution:

- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `AUTO_BUILDER_VERCEL_PROJECT_ID` or `VERCEL_PROJECT_ID`
- `AUTO_BUILDER_OPERATOR_TOKEN` or `AUTO_BUILDER_BRIDGE_TOKEN` for execute/approval routes

Required for receipt persistence when Supabase telemetry is live:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The workflow does not expose secret values. It only uses server-side environment variables.

## Deployment Order

1. Open draft PR from `auto-builder/vercel-workflow-handoff-20260616`.
2. Let Vercel build a preview for the PR.
3. Verify the workflow start route with a dry-run request first.
4. Start preview automation with `mode=execute`, `deploymentMode=preview` from an operator-authenticated request.
5. Stream workflow events and confirm the receipt reports success.
6. Keep production blocked unless a separate production approval is granted.

## Start Request Shape

Dry-run:

```json
{
  "mode": "dry_run",
  "deploymentMode": "preview",
  "targetSystem": "auto_builder",
  "ref": "main"
}
```

Preview execute:

```json
{
  "mode": "execute",
  "deploymentMode": "preview",
  "targetSystem": "auto_builder",
  "ref": "main",
  "verifyRoutes": [
    "/api/runtime/readiness",
    "/api/runtime/jobs",
    "/api/browser/process",
    "/api/bridge/vercel/redeploy",
    "/api/mcp/manifest"
  ]
}
```

Production execute requires the workflow approval hook and exact phrase:

```json
{
  "token": "<token emitted by awaiting_approval event>",
  "approved": true,
  "approvalPhrase": "APPROVE PRODUCTION DEPLOY",
  "approvedBy": "operator"
}
```

## Approval-Required Actions

The workflow must not perform these without explicit approval:

- production deploy
- environment mutation
- Supabase production migration
- Drive write
- social publishing
- outbound message
- billing or spend
- destructive action

## Post-Release Checks

The workflow verifies these routes by default:

- `/api/runtime/readiness`
- `/api/runtime/jobs`
- `/api/browser/process`
- `/api/bridge/vercel/redeploy`
- `/api/mcp/manifest`

A successful run means the Vercel preview reached `READY` and all configured route checks returned healthy responses.

## Rollback Path

Preview rollback:

- Discard the preview deployment.
- Rerun the workflow against a prior known-good commit or branch.

Production rollback, if separately approved and ever used:

- Promote or redeploy the prior known-good Vercel production deployment.
- Keep rollback metadata attached to the production approval receipt.

## Blockers Or Missing Pieces

- Workflow run execution still needs Vercel preview validation after PR creation.
- Operator-authenticated execute requests require configured `AUTO_BUILDER_OPERATOR_TOKEN` or `AUTO_BUILDER_BRIDGE_TOKEN`.
- Receipt persistence falls back to dry-run payload return if Supabase telemetry env is not configured.

## Next Best Prompt

AUTO BUILDER, open the draft PR for `auto-builder/vercel-workflow-handoff-20260616`, wait for the Vercel preview, then start the handoff workflow in dry-run mode and verify the run status, event stream, and route contract before any execute-mode preview run.
