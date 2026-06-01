# GPT GitHub Workflow Dispatch Bridge

## Purpose

This governed bridge capability allows GPT, after exact current-session approval, to request a GitHub Actions `workflow_dispatch` run for an existing workflow.

This bridge does not bypass governance. It only converts an approved GPT intent into a structured dispatch request that can be validated, executed, and audited.

## Name

`GPT_GITHUB_WORKFLOW_DISPATCH_BRIDGE`

## Required Target

- Repo: `Strategic-Minds/AUTO_BUILDER`
- Workflow file: `.github/workflows/awos-gpt-workflow-bridge.yml`

## Required Inputs

- `repo`
- `workflow_file`
- `ref`
- `reason`
- `approval_text`

## Required Approval

The request must include exact current-session approval. The approval text must explicitly authorize dispatching the named workflow in the named repo.

Example approval text:

```text
APPROVAL GRANTED: Trigger workflow_dispatch for Strategic-Minds/AUTO_BUILDER .github/workflows/awos-gpt-workflow-bridge.yml on main. Do not mutate EDENSKYESTUDIOS, Shopify, Vercel, Supabase, Drive, env vars, billing, domains, or social accounts.
```

## Safety Rules

The bridge must not dispatch workflows unless:

1. `currentSessionExplicitCommand` is `true`.
2. `repo` is exactly `Strategic-Minds/AUTO_BUILDER` unless separately approved.
3. `workflow_file` is exactly `.github/workflows/awos-gpt-workflow-bridge.yml` unless separately approved.
4. `approval_text` contains `APPROVAL GRANTED`.
5. `ref` is present.

## Output

The bridge returns:

- `status`
- `repo`
- `workflow_file`
- `ref`
- `workflow_run_url` when available
- `run_id` when available
- `errors`
- `next_validation_step`

## Result States

- `awaiting_approval`
- `dispatched`
- `failed`
- `blocked`

## Validation Plan

1. Dispatch the workflow.
2. Inspect GitHub Actions runs for the target workflow.
3. Fetch jobs and logs.
4. Fetch artifacts if present.
5. Report result and errors.

## Rollback Plan

No rollback is required for a dispatch event. If the workflow produces unwanted behavior, disable or update the workflow file through the existing governed GitHub workflow bridge.
