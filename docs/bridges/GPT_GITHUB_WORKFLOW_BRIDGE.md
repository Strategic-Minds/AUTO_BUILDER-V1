# GPT to GitHub Workflow Bridge

## Purpose

This bridge defines the governed path that allows GPT, through the verified GPT MCP bridge layer inside AUTO BUILDER, to create or update GitHub Actions workflows in the canonical source repo.

This bridge does not bypass governance.

It turns GPT intent into a structured workflow-creation request that can be validated, approved when required, and then written into GitHub as a workflow file.

## Verified System Context

- Repo: `Strategic-Minds/AUTO_BUILDER`
- GitHub is a first-class source-control layer.
- GPT MCP is already declared in the repo README as a verified connected bridge layer.
- Existing bridge surfaces already declared in the repo README:
  - `/api/bridge/registry`
  - `/api/bridge/http`
  - `/api/bridge/webhook`

## Bridge Objective

Enable GPT to safely create or update GitHub workflow files such as:

- `.github/workflows/<name>.yml`

through a governed bridge path that enforces:

- source-truth inspection
- workflow specification structure
- safety checks
- approval gates for consequential mutation
- audit-ready result reporting

## Bridge Contract

### Input

GPT must provide a structured workflow creation request with these fields:

- `repo`
- `target_path`
- `workflow_name`
- `workflow_goal`
- `trigger_type`
- `schedule_cron` when applicable
- `jobs`
- `permissions`
- `secrets_required`
- `writes_repo_contents`
- `writes_external_systems`
- `requires_human_approval`
- `validation_plan`
- `rollback_plan`

### Output

The bridge should return:

- `status`
- `repo`
- `target_path`
- `workflow_sha` when created or updated
- `approval_state`
- `validation_state`
- `result_summary`
- `blockers`
- `next_action`

## Governance Rules

The bridge must not allow GPT to directly write a workflow file unless the governing session authorizes that exact mutation.

Before mutation, the bridge should classify the request:

### Low-risk examples

- read-only verification workflows
- artifact export workflows
- non-destructive scheduled audit jobs

### Higher-risk examples

- workflows that mutate production environments
- workflows that use sensitive secrets
- workflows that deploy to Vercel or mutate Supabase
- workflows that can change billing, domains, stores, or stateful backends

If the workflow is high-risk, the bridge must hold at approval.

## Recommended Bridge Flow

1. GPT creates a structured workflow request.
2. The bridge validates required fields.
3. The bridge checks whether the target path is new or existing.
4. The bridge checks risk class.
5. The bridge either:
   - returns `awaiting_approval`
   - or writes the workflow file through the GitHub bridge
6. The bridge returns a result payload with SHA and validation instructions.

## Canonical Use Case

The first canonical use case is allowing GPT to create a governed GitHub Actions workflow in the canonical source repo.

This includes workflows such as:

- bucket verification
- readiness audit
- passive reverse engineering
- scheduled health checks
- validation artifact collection

## Example Request Shape

```json
{
  "repo": "Strategic-Minds/AUTO_BUILDER",
  "target_path": ".github/workflows/example.yml",
  "workflow_name": "Example Workflow",
  "workflow_goal": "Run a governed read-only recurring verification task.",
  "trigger_type": "schedule",
  "schedule_cron": "*/5 * * * *",
  "jobs": [
    {
      "job_id": "verify",
      "runs_on": "ubuntu-latest",
      "steps": [
        "actions/checkout@v4",
        "actions/setup-python@v5",
        "python automation/example.py"
      ]
    }
  ],
  "permissions": {
    "contents": "read"
  },
  "secrets_required": [],
  "writes_repo_contents": false,
  "writes_external_systems": false,
  "requires_human_approval": false,
  "validation_plan": [
    "Run manually with workflow_dispatch.",
    "Inspect logs.",
    "Validate artifact output."
  ],
  "rollback_plan": [
    "Disable workflow.",
    "Revert workflow file."
  ]
}
```

## Bridge Result States

- `validated`
- `awaiting_approval`
- `created`
- `updated`
- `blocked`
- `failed`

## Minimal Success Condition

The bridge is working if GPT can:

1. express a workflow request in the contract shape
2. route that request through a governed bridge surface
3. create or update a workflow file in GitHub
4. return an audit-ready result payload

## Current Best Implementation Path

Inside AUTO BUILDER, the best current implementation path is:

- GPT MCP request
- bridge contract validation
- GitHub contents API write
- GitHub Actions run inspection
- artifact inspection
- audit-ready final result

## Relationship To Existing AUTO BUILDER Work

The existing AWOS bucket verifier runner package and workflow are valid examples of this bridge outcome.

They prove the repo can already host a governed workflow package and scheduled GitHub Actions workflow.

This document makes that capability explicit as a reusable GPT-to-GitHub workflow bridge standard.
