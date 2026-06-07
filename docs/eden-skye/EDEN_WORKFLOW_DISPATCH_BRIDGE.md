# Eden Workflow Dispatch Bridge

Date: 2026-06-07
Mode: `preview_only`
Owner: Auto Builder
Target: Eden Skye Studios Shopify V1 approved mockup build

## Purpose

This bridge gives Auto Builder and Eden GPT runtime a governed way to dispatch GitHub Actions workflows, then read runs and jobs without needing a separate manual GitHub UI step.

## Runtime Routes

### List Workflows

```text
GET /api/bridge/github/workflows?repo=Strategic-Minds/EDENSKYESTUDIOS
```

### Dispatch Workflow

```text
POST /api/bridge/github/workflows/dispatch
```

Body:

```json
{
  "repoFullName": "Strategic-Minds/EDENSKYESTUDIOS",
  "workflow_id": "vercel-redeploy.yml",
  "ref": "shopify/v1-website-preview",
  "inputs": {
    "environment": "preview",
    "target_project": "edenskyestudios",
    "vercel_project_id": "prj_mtmJQYYqRodNnH2UrDqwaK2MHgoA",
    "production_locked": "true",
    "shopify_mutation_locked": "true",
    "reason": "Build Eden Skye Shopify V1 from approved Drive mockup through Auto Builder packet"
  }
}
```

### List Runs

```text
GET /api/bridge/github/workflows/runs?repo=Strategic-Minds/EDENSKYESTUDIOS&workflow_id=vercel-redeploy.yml&branch=shopify/v1-website-preview
```

### List Jobs

```text
GET /api/bridge/github/workflows/runs/:run_id/jobs?repo=Strategic-Minds/EDENSKYESTUDIOS
```

## Required Environment Variables

At least one GitHub token variable must be configured:

```text
GITHUB_TOKEN
GITHUB_PAT
AUTO_BUILDER_GITHUB_TOKEN
```

Optional inbound bridge auth:

```text
AUTO_BUILDER_BRIDGE_TOKEN
```

When `AUTO_BUILDER_BRIDGE_TOKEN` is set, callers must pass either:

```text
Authorization: Bearer <token>
```

or:

```text
x-bridge-token: <token>
```

## Safety Locks

The dispatch route rejects requests unless:

```text
environment = preview
production_locked = true
shopify_mutation_locked = true
```

This bridge cannot be used for production deploy, Shopify mutation, or payment changes.

## Next Use

After this branch deploys, call:

1. `GET /api/bridge/github/workflows`
2. `POST /api/bridge/github/workflows/dispatch`
3. `GET /api/bridge/github/workflows/runs`
4. `GET /api/bridge/github/workflows/runs/:run_id/jobs`

Then attach the workflow run/job result to the Eden Shopify V1 build proof packet.
