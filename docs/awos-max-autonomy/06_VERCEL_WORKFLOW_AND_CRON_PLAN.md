# Vercel Workflow And Cron Plan

## Verified Platform Notes

- Vercel Workflow is available in beta and uses the `workflow` package.
- Vercel Cron can invoke production routes from `vercel.json`.
- A five-minute cron uses `*/5 * * * *`.
- `CRON_SECRET` should be used to authorize cron requests.

## Current Repo Alignment

- The live repo already contains a five-minute recursive-control cron path.
- The next runtime move should extend the existing recursive loop rather than replace it with a second parallel control plane.

## Planned Runtime Flow

1. Cron route fires every five minutes in production.
2. Cron route starts the governed recursive control loop.
3. The loop rehydrates doctrine and current state.
4. The loop separates safe work from protected work.
5. Safe work routes immediately.
6. Protected work remains explicit and approval-gated.

## Sandbox Rule

Workflow can prepare sandbox work items and external execution packets automatically. Live deploy, schema mutation, payment mutation, and live publishing still require approval.
