# Vercel Sandbox And Five-Minute Cron Completion Packet

Date: 2026-06-07
Status: Mandatory sandbox/cron packet

## Mission

Use Vercel Sandbox and a five-minute non-mutating cron validator to keep checking the master completion TODO until every item is evidence-backed.

## Sandbox Rules

- Sandbox first.
- Preview second.
- Production only after approval.
- No secret values in logs.
- No live social publishing.
- No billing mutation.
- No production DB mutation.
- No customer messaging.

## Required Sandbox Work

1. Install dependencies.
2. Run lint.
3. Run typecheck.
4. Run build.
5. Run route smoke.
6. Run browser smoke.
7. Run connector dry-runs.
8. Emit receipts.
9. Write artifacts to evidence folders.

## Five-Minute Cron Route

Recommended route:

`app/api/cron/master-completion-validator/route.ts`

Required behavior:

- Run every five minutes.
- Non-mutating by default.
- Read master TODO.
- Read status matrix.
- Read latest receipts.
- Identify next incomplete item.
- Emit validator receipt.
- Notify Google Chat or app push only if configured.
- Never perform protected actions without approval.

## Cron Output

Each tick must output:

- `tick_id`
- `timestamp`
- `total_items`
- `complete_items`
- `blocked_items`
- `pending_items`
- `next_action`
- `approval_required`
- `receipt_url_or_path`

## Validation Task

The validator task is complete when it can repeatedly prove:

- the checklist is loaded,
- status is current,
- missing receipts are identified,
- blocked items have owners and next action,
- protected actions are still blocked.

## Hard Gates

- If Drive write is unavailable, record Drive write hard gate.
- If Supabase dev branch is unavailable, record Supabase hard gate.
- If Playwright runner is unavailable, record browser runner hard gate.
- If connector credentials are unavailable, record connector hard gate.
