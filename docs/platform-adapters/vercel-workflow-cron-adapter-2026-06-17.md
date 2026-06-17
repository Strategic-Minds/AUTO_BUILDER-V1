# Vercel Workflow Cron Adapter Sync - 2026-06-17

## Problem

The Auto Builder MCP `create_vercel_workflow` tool returned `not_implemented` in execute mode for the Strategic Minds Advisory OS validation workflow.

Requested workflow:

- Workflow: `strategic-minds-advisory-os-validation`
- Target repo: `Strategic-Minds/WEBSITE-FACTORY`
- Route: `/api/cron/validation`
- Schedule: `*/5 * * * *`
- Timezone: `UTC`

## Fix Applied

`src/lib/autobuilder-v2/platform-provisioning-runner.ts` now includes a `createVercelWorkflowAdapter` implementation.

The adapter treats Vercel cron workflow submission as a GitHub-backed Vercel configuration update:

1. Parse the target GitHub repo from `github_owner`/`github_repo` or `git_repository_url`.
2. Read existing `vercel.json` from the target repo.
3. Create or update the `crons` entry for the workflow route.
4. Commit the updated `vercel.json` back to GitHub.
5. Return `created` or `updated` with a GitHub resource URL and receipt metadata.

## Approval Requirement

Live execution still requires:

- `mode=execute`
- `approved_actions` containing `create_vercel_workflow`
- `GITHUB_TOKEN` available in the Auto Builder runtime

## Expected Result

After Auto Builder redeploys, running `create_vercel_workflow` or `run_platform_provisioning_job` with approved `create_vercel_workflow` should update the target repo's `vercel.json` instead of returning `not_implemented`.

## Notes

This adapter does not create a separate Vercel dashboard object. It submits Vercel Cron through the supported project configuration file, which Vercel reads during deployment.
