# Codex Packet

## Current Status

Codex is active as the implementation agent in this workflow, and the connected GitHub app can create branches, files, and PRs. The AUTO_BUILDER runtime also reports a partial Codex connector in factory readiness. A complete in-app Codex bridge with queue receipts was not verified.

## Source Truth

- GPT/AUTO BUILDER orchestrates.
- Codex implements branch-scoped code changes.
- Production mutation, merges, deployments, secrets, and database writes remain gated.

## System Boundary

Codex may inspect repos, create or update branch-scoped files, run local tests when a workspace is available, prepare PRs, and write proof docs. Codex must not merge, deploy production, rotate secrets, mutate live database schema, or trigger money/store/social actions without explicit approval.

## Backend Plan

- Add `codex_jobs` table with request, branch, target files, status, receipts, errors, and approval state.
- Add `/api/codex/jobs` and `/api/codex/jobs/[id]` routes.
- Add queue integration so GPT/frontend can request branch-scoped Codex work.
- Store all generated patches, test logs, and PR links as receipts.
- Add policy classifications: read, write-branch, execute-local, execute-sandbox, production-gated.

## Frontend Plan

- Add Codex Jobs panel with job status, files changed, test results, PR link, and blocked actions.
- Add build-packet viewer that can launch a Codex job only after route policy passes.

## Validation Plan

1. Create harmless Codex job from build packet.
2. Write a branch-only proof file.
3. Run safe local validation or report unavailable runtime.
4. Open draft PR.
5. Confirm no production mutation.
6. Record receipts in Supabase sandbox or artifact doc.

## Required GitHub Actions Dispatch Bridge

- Read workflows and runs autonomously.
- Dispatch only safe workflow_dispatch jobs by default.
- Require explicit approval phrase for production, release, publish, Shopify, Stripe, migration, delete, or destroy terms.
- Store dispatch request, approval state, workflow id, run id, and logs.

## Blockers

- Existing bridge PR is diverged and must be reconciled.
- Supabase job persistence requires branch-safe schema work.
- v0 frontend is not yet synced to the final Codex job contract.

## Next Best Prompt

Implement Codex job queue and GitHub Actions dispatch bridge against current main, branch-scoped only, with receipts and approval gates. Produce harmless branch-write and workflow-read smoke evidence.
