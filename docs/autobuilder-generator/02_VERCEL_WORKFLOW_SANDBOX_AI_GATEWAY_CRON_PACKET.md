# Vercel Workflow, Sandbox, AI Gateway, And 5-Minute Cron Packet

## Current Status

AUTO BUILDER already has Vercel Cron, Vercel Workflow, Vercel Sandbox, Supabase telemetry helpers, Playwright/browser worker infrastructure, bridge routes, and v0 command-center visibility. The missing piece is a dedicated generator factory loop that turns requests into build packets and sandbox tasks.

## Source Truth

- `docs/autobuilder-generator/00_REPO_ANALYSIS_AND_FEATURE_TODO.md`
- `docs/awos-max-autonomy/00_SOURCE_OF_TRUTH_MAP.md`
- `docs/awos-max-autonomy/06_VERCEL_WORKFLOW_AND_CRON_PLAN.md`
- `docs/awos-max-autonomy/09_BUILD_PACKET.md`
- `agent_files/awos/MONEY_MACHINE_OPERATING_SYSTEM.md`
- `agent_files/builder-docs/*`
- AUTO BUILDER PR #13
- v0 PR #1

## System Boundary

The generator may inspect, plan, queue, validate, and record receipts. It may not perform live production, database, billing, commerce, publishing, or external-message mutations without explicit approval.

## Vercel Cron Plan

Add a five-minute trigger:

```json
{
  "path": "/api/cron/autobuilder-generator",
  "schedule": "*/5 * * * *"
}
```

The route must authorize through `CRON_SECRET` or `CRON_API_TOKEN` when configured. If no token exists in local validation, it may run in open local mode and report that fact.

## Vercel Workflow Plan

Workflow name: `awos-generator-factory-workflow`

Required durable steps:

1. Rehydrate source truth.
2. Read bridge and repo status.
3. Define done-state contract.
4. Reverse engineer from done state back to current state.
5. Generate feature TODO matrix.
6. Generate implementation packet.
7. Generate sandbox task payloads.
8. Generate frontend alignment payload.
9. Persist dry-run receipt or Supabase receipt when configured.
10. Stop at approval gates for protected actions.

## Vercel Sandbox Plan

Sandbox is used for generated code validation, artifact checks, and harmless local simulations.

Sandbox task template:

```json
{
  "jobId": "autobuilder-generator-<bucket>",
  "runtime": "node24",
  "allowNetwork": false,
  "inputs": ["build-packet.json", "repo-map.json", "validation-plan.json"],
  "command": "node validate-generator-artifact.mjs",
  "artifactPath": "generator-artifact.json"
}
```

Sandbox must not use live secrets, production database mutations, live deploys, billing, publishing, or credentialed browser actions.

## AI Gateway Plan

AI Gateway is the model-routing surface for generator agents. Required env name:

- `AI_GATEWAY_API_KEY`

Generator agent calls must include:

- model purpose
- max spend or budget class
- input source list
- expected schema
- refusal/gate rules
- receipt reference

No secret values are ever returned through bridge routes.

## Generator Agents

- Master Brain Agent: owns done-state and priority.
- Repo Analyst Agent: maps code, docs, PRs, and gaps.
- Reverse Engineer Agent: works backwards from done state.
- Build Packet Agent: creates implementation packet.
- Sandbox Planner Agent: creates Vercel Sandbox tasks.
- Frontend Alignment Agent: maps v0 panels and actions.
- Workflow Agent: maps cron, durable workflow, retries.
- QA Agent: creates smoke and browser evidence plan.
- Governance Agent: blocks protected mutations.
- Recovery Agent: produces rollback and retry plan.

## Validation Plan

1. GET `/api/cron/autobuilder-generator` with cron token where configured.
2. Verify JSON includes source truth, feature TODO groups, generator agents, workflow steps, sandbox steps, and approval gates.
3. Run GitHub Actions generator smoke.
4. Capture browser screenshot of v0 bridge page and AUTO generator route.
5. Confirm no protected mutation occurred.
6. Confirm Supabase receipt is dry-run unless env and admin-write gates are enabled.

## Blockers Or Missing Pieces

- POST/browser smoke requires GitHub Actions or another runner with outbound access.
- Supabase generator queue persistence needs table/schema confirmation and approval.
- v0 needs generator panels beyond the current action-surface link.
- Local device bridge work discovered in uploaded evidence still needs clean reconciliation into a repo branch.

## Next Best Prompt

Run the generator smoke workflow, then implement generator queue persistence and v0 generator panels from the evidence produced by `/api/cron/autobuilder-generator`.
