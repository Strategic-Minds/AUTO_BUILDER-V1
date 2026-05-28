# Vercel Workflow And Cron Plan

## Verified Platform Notes

- Vercel Workflow is available in beta and uses the `workflow` package for durable execution.
- Vercel Cron invokes production routes from `vercel.json`.
- A five-minute cron uses `*/5 * * * *`.
- `CRON_SECRET` is the preferred production cron authorization secret.
- Vercel Sandbox is available through `@vercel/sandbox` for isolated execution.

## Current Repo Alignment

- The live repo keeps the five-minute recursive-control cron path at `/api/cron/recursive-control`.
- The cron route now computes a five-minute bucket key and claims that bucket before starting durable work.
- The durable workflow now materializes an explicit agent plan and can run an isolated sandbox validation pass.
- Protected actions remain approval-gated even when the loop is fully automatic.

## Implemented Runtime Flow

1. Vercel Cron fires every five minutes in production.
2. The cron route authorizes with `CRON_SECRET` or `CRON_API_TOKEN`.
3. The route computes a normalized five-minute bucket key.
4. The route claims the bucket in scheduler telemetry to prevent duplicate runs.
5. The route starts the governed recursive control workflow.
6. The workflow rehydrates doctrine, blockers, budgets, and queue state.
7. The workflow builds an explicit multi-agent task plan.
8. Sandbox-tagged tasks run through Vercel Sandbox when enabled.
9. Queue jobs, agent plan telemetry, and sandbox telemetry are persisted.
10. Protected work stays staged for approval instead of mutating production automatically.

## Agent Topology In This Loop

- Master Brain Agent: doctrine reconciliation and loop ownership
- Planner Agent: queue routing and bounded task planning
- Governance Agent: approval gates and elevated risk control
- Memory Agent: continuity snapshots and durable next-step evidence
- Sandbox QA Agent: isolated runtime validation in Vercel Sandbox
- Recovery Agent: worker-staleness and retry response

## Sandbox Rule

- Sandbox is used only for isolated validation, generated-runtime checks, and safe evidence creation.
- Sandbox does not authorize deployment, billing mutation, schema mutation, or live publishing.
- If `AUTO_BUILDER_SANDBOX_ENABLED` is false, the loop records a safe skip instead of failing hard.
