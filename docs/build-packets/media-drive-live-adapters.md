# Media Drive Live Adapters Build Packet

## Purpose

This follow-up lane turns the PR #38 scaffold into a production-candidate Media Drive MCP only after live-path evidence exists. PR #38 remains draft/scaffold-only until this lane proves the live adapter path safely.

## Source Lane

- Source PR: #38 `Add AUTO_BUILDER_2 Media Drive Pipeline`
- Source branch: `auto-builder/media-drive-pipeline`
- Source head: `d669047d7ed191fe36337222abdb84c2431e056e`
- Follow-up branch: `auto-builder/media-drive-live-adapters-20260610`
- Follow-up PR: #46 `Wire Media Drive live adapters behind approval gates`

## Required Work

1. Wire live Google Drive adapter behavior behind explicit environment gates.
2. Wire live image generation adapter behavior behind explicit environment gates.
3. Add an approved-write dry-run path that proves a non-destructive Drive operation can be planned, gated, executed, and receipted.
4. Confirm durable receipt persistence for live-path operations.
5. Preserve hard gates for delete actions, source-truth moves, protected folder mutations, and any destructive operation.
6. Add preview validation that exercises both scaffold fallback and approved-write dry-run behavior.
7. Keep production validation blocked unless an explicit production-safe validation mode is approved.

## Implemented Controls

- Google Drive writes require `MEDIA_DRIVE_LIVE_ENABLED=1`, `MEDIA_DRIVE_APPROVED_WRITE_ENABLED=1`, `approved_write=true`, and the approved-write token when configured.
- Approved-write dry run uses `approved_write=true` plus `approved_write_dry_run=true`; it must return `liveMutation:false`.
- Image generation requires `OPENAI_API_KEY` plus `MEDIA_DRIVE_IMAGE_LIVE_ENABLED=1` before live image generation can run.
- Durable receipt persistence uses Supabase `runtime_telemetry_events` when `MEDIA_DRIVE_RECEIPT_PERSISTENCE_ENABLED=1` or `require_durable_receipt=true`.
- The preview validator is blocked in production.
- Hard-gated actions return `liveMutation:false` and must not call Drive mutation APIs.

## Production-Safe Live-Write Rollout Plan

### Phase 0: Scaffold and dry-run validation

Status: completed on PR #46 preview.

Required evidence:

- Vercel preview deployment reaches `READY`.
- `/api/mcp-media-drive-preview-validation` returns `ok:true`.
- `tools/list` exposes all expected Media Drive tools.
- hard-gated `tools/call` returns `status:"hard_gated"` and `liveMutation:false`.
- approved-write dry-run returns `adapterMode:"approved_write_dry_run"` and `liveMutation:false`.
- Supabase confirms a `media_drive_receipt` row with `event_status:"dry_run"` and `live_mutation:false`.

### Phase 1: Credential readiness review

No Drive write may happen in this phase.

Required evidence:

- Confirm the selected Drive root folder is a sandbox/test folder, not `00 Source Truth`, client delivery, legal, security, or production archive.
- Confirm service account or token scope is limited to the minimum required Drive access.
- Confirm approved-write token is configured and not logged.
- Confirm rollback inspection path for every writable tool.
- Confirm Supabase receipt persistence remains enabled.

### Phase 2: Single approved non-destructive write

Requires explicit operator approval before execution.

Allowed test:

- One `drive_copy_file` or `drive_create_folder_tree` operation inside a sandbox Drive folder.
- No public share, permission change, delete, overwrite, source-truth move, client-delivery overwrite, external send, or spend.

Required evidence:

- Tool result returns `liveMutation:true` only for the approved operation.
- Receipt persistence returns `persisted:true` with a telemetry key.
- Supabase lookup confirms the telemetry row.
- Drive inspection confirms the object exists only in the sandbox target.
- Rollback inspection is documented before any cleanup action.

### Phase 3: Limited preview soak

Requires successful Phase 2 evidence.

Allowed tests:

- Multiple non-destructive copy/folder operations in the sandbox folder.
- Optional image generation only if spend budget and model are explicitly approved.

Required evidence:

- All operations generate durable receipts.
- Hard gates still block protected paths and destructive flags.
- No operation touches production folders.
- No production deployment approval is requested during soak.

### Phase 4: Production approval request

Only after Phases 0-3 pass.

Approval request must include:

- PR number and head SHA.
- Vercel preview URL and deployment ID.
- GitHub workflow run ID.
- Supabase telemetry keys for dry run and live sandbox write.
- Drive object IDs created in sandbox.
- Rollback or inspection instructions.
- Explicit statement that production approval is being requested.

## Non-Negotiable Gates

- No production deployment approval can be requested from PR #38 alone.
- No production approval can be requested from this follow-up lane until preview validation proves:
  - live adapters are configured only when explicitly enabled
  - hard-gated actions return `liveMutation:false`
  - approved-write dry run completes with durable receipt confirmation
  - receipt lookup succeeds by stable telemetry or receipt key
  - rollback instructions are documented
- No real Drive mutation can occur without explicit operator approval for that live-write phase.
- No social publishing, external sending, public sharing, billing action, spend, destructive action, or permission mutation is allowed from this lane without separate explicit approval.

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

PR #46 may become the live-adapter review lane only after GitHub workflow evidence is attached. It may become a production candidate only after all live-path evidence exists and the operator explicitly approves production deployment.
