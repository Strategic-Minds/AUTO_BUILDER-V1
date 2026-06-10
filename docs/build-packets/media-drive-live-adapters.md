# Media Drive Live Adapters Build Packet

## Purpose

This follow-up lane turns the PR #38 scaffold into a production-candidate Media Drive MCP only after live-path evidence exists. PR #38 remains draft/scaffold-only until this lane proves the live adapter path safely.

## Source Lane

- Source PR: #38 `Add AUTO_BUILDER_2 Media Drive Pipeline`
- Source branch: `auto-builder/media-drive-pipeline`
- Source head: `d669047d7ed191fe36337222abdb84c2431e056e`
- Follow-up branch: `auto-builder/media-drive-live-adapters-20260610`

## Required Work

1. Wire live Google Drive adapter behavior behind explicit environment gates.
2. Wire live image generation adapter behavior behind explicit environment gates.
3. Add an approved-write dry-run path that proves a non-destructive Drive operation can be planned, gated, executed, and receipted.
4. Confirm durable receipt persistence for live-path operations.
5. Preserve hard gates for delete actions, source-truth moves, protected folder mutations, and any destructive operation.
6. Add preview validation that exercises both scaffold fallback and approved-write dry-run behavior.
7. Keep production validation blocked unless an explicit production-safe validation mode is approved.

## Non-Negotiable Gates

- No production deployment approval can be requested from PR #38 alone.
- No production approval can be requested from this follow-up lane until preview validation proves:
  - live adapters are configured only when explicitly enabled
  - hard-gated actions return `liveMutation:false`
  - approved-write dry run completes with durable receipt confirmation
  - receipt lookup succeeds by stable telemetry or receipt key
  - rollback instructions are documented

## Expected Evidence

- GitHub workflow validation for the follow-up branch head.
- Vercel preview deployment in `READY` state.
- POST-capable preview validation response for:
  - `tools/list`
  - hard-gated `tools/call`
  - approved-write dry-run `tools/call`
  - receipt lookup by key
- Supabase or durable store confirmation for the live-path receipt row.

## Release Decision

Default decision: keep PR #38 draft and scaffold-only.

This follow-up branch may become the production candidate only after all live-path evidence exists and the operator explicitly approves production deployment.
