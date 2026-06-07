# Vercel Workflow Submit Bridge

## Purpose

This bridge exists only to clear the current network blocker where the Codex container cannot POST directly to the Vercel preview factory intake.

It does not build a system. It does not widen permissions. It does not execute protected actions.

## Bridge Files

- `.github/workflows/vercel-workflow-submit-bridge.yml`
- `scripts/submit-vercel-workflow-bridge.mjs`
- `factory/workflow-submissions/master-system-completion-vercel-workflow-20260607.json`

## What It Does

1. Reads the master completion submission packet.
2. POSTs the packet to the Vercel factory intake from a GitHub Actions runner.
3. Writes `workflow-receipts/vercel-workflow-submit-bridge.json`.
4. Uploads that receipt as a GitHub Actions artifact.

## Default Target

```text
https://auto-builder-git-auto-builder-u-bdac7f-strategic-minds-advisory.vercel.app/api/factory/build-packet
```

## Allowed Scope

Allowed:

- Harmless POST to factory build-packet intake.
- Receipt generation.
- Artifact upload.

Not allowed:

- Production deploy.
- Production database migration.
- Secret changes.
- Payment, billing, or commerce mutation.
- Live social publishing.
- Customer messages.
- Destructive actions.
- Spend.
- Credentialed browser action.

## How To Run

The workflow runs automatically when the bridge files or master submission packet change on PR #19.

It can also be run manually as `Vercel Workflow Submit Bridge` with optional `target_url` override.

Use `dry_run=true` to validate the packet without posting.

## Acceptance Evidence

The blocker is cleared only when a GitHub Actions run uploads a receipt where:

- `status` is `submitted`
- `response.ok` is `true`
- `response.status` is `200`
- `response.parsed.status` is `ok`
- `response.parsed.buildPacket` exists

If the run fails, preserve the artifact and classify the failure as a hard gate with exact status and error.
