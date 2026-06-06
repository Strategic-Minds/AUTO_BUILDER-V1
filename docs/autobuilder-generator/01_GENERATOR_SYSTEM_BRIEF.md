# AUTO BUILDER Generator System Brief

## System Name

AUTO BUILDER Generator Factory

## System Type

Governed autonomous build generator, Vercel Workflow subsystem, Vercel Sandbox task planner, and v0/front-end command alignment layer.

## Business Goal

Remove the operator from repetitive build translation work. The operator gives a high-level intent; AUTO BUILDER turns it into source-truth alignment, a done-state contract, a build packet, sandbox tasks, validation evidence, approval gates, and frontend-visible status.

## Problem Solved

The current system has strong doctrine, bridge routes, and partial workflow automation, but the operator still has to repeatedly restate the build intent and manually connect GPT, repo, v0, Vercel, Supabase, browser QA, and release steps. The generator factory becomes the no-copy-paste build brain.

## Primary Users

- Operator using GPT from phone or desktop.
- v0 frontend command center user.
- AUTO BUILDER orchestration runtime.

## Secondary Users

- Vercel Workflow runtime.
- GitHub Actions smoke runner.
- Supabase telemetry/queue layer.
- Google Chat operator alert surface.
- Sandbox validation worker.

## In Scope

- Source-truth rehydration.
- Repo and frontend alignment analysis.
- Done-state definition.
- Reverse-engineered backlog generation.
- Feature TODO generation.
- Build packet creation.
- Vercel Workflow and 5-minute cron design.
- Vercel Sandbox task generation.
- AI Gateway agent routing contract.
- Browser smoke evidence planning.
- GitHub Actions dispatch smoke.
- v0 bridge/action surface alignment.
- Approval gates and recovery rules.

## Out Of Scope For Autonomous Execution

- Production deploy or alias promotion.
- Secret value mutation.
- Supabase schema or production data mutation.
- Shopify product, payment, inventory, or publishing mutation.
- Stripe money movement.
- Google Chat outbound messages.
- Credentialed browser actions.
- Public publishing, paid ads, or mass outreach.

## End State

A request can move from GPT/operator intent to generator docs, queue jobs, sandbox-safe work, smoke evidence, v0 visibility, and merge-ready handoff with minimal manual translation.

## Success Criteria

- Generator docs exist in repo and are linked from PRs.
- `/api/cron/autobuilder-generator` returns a structured generator plan and safe receipt.
- Vercel cron includes a five-minute generator trigger.
- GitHub Actions can smoke generator routes and capture browser evidence.
- v0 displays a generator action surface pointed at AUTO BUILDER.
- Supabase writes remain disabled unless approved env/gates are present.
- All protected mutations remain gated.

## Delivery Standard

Branch-safe, preview-first, sandbox-first, receipt-backed. Every generated action must carry source truth, risk class, approval state, and next verification step.
