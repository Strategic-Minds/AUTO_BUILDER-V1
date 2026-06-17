# Enterprise Vercel Automation Builder Package

Date: 2026-06-17
Scope: Vercel Workflows, 5-minute crons, Vercel validation agents, Playwright/Chromium browser worker, and validation automation.

## Purpose

This package defines the build list and operating contract required to move Auto Builder toward a governed, 24/7 automation system. It is intentionally split into docs and manifest files so Vercel-enabled agents can implement, validate, and harden each lane without guessing.

## Builder Docs In This Package

1. `VERCEL_WORKFLOWS_CRONS_5_MIN_BUILDER_DOC_LIST.md`
   - Exhaustive builder doc list for Vercel Workflows and 5-minute cron orchestration.
   - Defines every required workflow lane, route, owner, telemetry signal, receipt, validation gate, and failure behavior.

2. `VERCEL_VALIDATION_AGENTS_SPEC.md`
   - Vercel Agent validation architecture.
   - Defines validation agents, allowed tools, blocked actions, expected outputs, escalation states, and approval gates.

3. `PLAYWRIGHT_CHROMIUM_BROWSER_WORKER_SPEC.md`
   - Browser worker operating model for Chromium and Playwright in Vercel.
   - Documents the existing `/api/browser/process` route, serverless Chromium behavior, required env vars, queue contracts, evidence capture, screenshots, and worker URL installation path.

4. `ENTERPRISE_AUTOMATION_IMPLEMENTATION_MANIFEST.json`
   - Machine-readable implementation manifest for Vercel-enabled agents.
   - Separates implemented, scaffolded, pending, and operator-required actions.

## Existing Repo Capabilities Verified Before This Package

- `package.json` already includes `playwright`, `playwright-core`, and `@sparticuz/chromium`.
- `src/app/api/browser/process/route.ts` already supports serverless Chromium through `@sparticuz/chromium` on Vercel/AWS-like runtimes.
- `vercel.json` already contains 5-minute crons for recursive control, generator, and social bridge lanes.
- `vercel.json` previously ran `/api/browser/process` every 10 minutes. This package changes it to 5 minutes.
- `src/lib/runtime-telemetry.ts` already expects `PLAYWRIGHT_WORKER_URL` or `PLAYWRIGHT_HEARTBEAT_URL` as browser-worker evidence inputs.

## Safety Boundary

This package does not perform live Vercel env mutation, deployment, workflow rerun, production database migration, secret change, billing/commerce write, public posting, customer message, or destructive action.

The Vercel env installation step is explicitly operator-gated until a Vercel-enabled agent confirms it through Vercel logs/settings/API.

## Required Vercel Env Target

After deployment, install this URL in Vercel env for the target environment:

- `PLAYWRIGHT_WORKER_URL=https://<auto-builder-vercel-domain>/api/browser/process`

Optional fallback:

- `PLAYWRIGHT_HEARTBEAT_URL=https://<auto-builder-vercel-domain>/api/browser/process`

Do not claim the env is installed until Vercel confirms it.
