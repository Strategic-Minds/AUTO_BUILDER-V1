# Sandbox Build Packet

## Current Status

- `@vercel/sandbox` is present in `package.json`.
- AUTO_BUILDER has preview deployments.
- Supabase development branches exist.
- No complete sandbox execution receipt was verified during this audit.

## Source Truth

- OS v1 docs require sandbox-first execution.
- User requires max autonomy without copy/paste while preserving gates.

## System Boundary

Sandbox can read, generate, test, and propose. It cannot mutate production, rotate secrets, deploy production, publish externally, move money, or alter live store/payment data.

## Backend Plan

- Add sandbox job table: `sandbox_runs` with status, input, branch, preview URL, receipts, errors, approval state.
- Add sandbox evidence table: `sandbox_evidence` for logs, screenshots, test summaries, and artifact links.
- Add API routes: `/api/sandbox/runs`, `/api/sandbox/runs/[id]`, `/api/sandbox/dispatch`.
- Route code generation through branch-scoped GitHub/Codex jobs.
- Route browser checks through Playwright worker.

## Frontend Plan

- Add Sandbox Runs panel.
- Show branch, preview, current step, evidence, rollback path, and blocked action reason.
- Provide approve/retry buttons only for allowed next actions.

## Validation Plan

1. Create harmless sandbox run.
2. Read harmless file.
3. Write harmless branch-only file.
4. Run harmless command.
5. Produce preview/browser screenshot if a preview exists.
6. Store evidence receipt.
7. Confirm production remains untouched.

## Blockers

- Branch drift on bridge PR.
- Supabase RLS advisor warnings.
- Need Google Chat approval webhook env configured through approved secret channel.

## Next Best Prompt

Build sandbox run persistence and UI panels on a fresh branch, using a Supabase development branch and a harmless smoke run. Stop at evidence and approval gate.
