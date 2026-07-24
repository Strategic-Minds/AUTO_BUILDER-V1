# Profit BrowserWorker 100 Sandbox

## Purpose

Isolate the AUTO BUILDER profit-first and BrowserWorker operating directive from unrelated application lint, runtime, deployment, and legacy repository failures.

This sandbox measures **directive implementation compliance** only. A score of 100/100 here does not claim that a customer website has achieved 100% visual or operational parity.

## Sandbox contract

- Branch: `sandbox/profit-browserworker-100-20260724`
- Parent authority branch: `auto-builder/profit-browserworker-directive-20260724`
- Scorecard: 20 deterministic checks at 5 points each
- Required score: 100/100
- Runner: GitHub Actions with Node 24
- External services: none
- Secrets: none
- Database writes: none
- Production changes: none

## What 100/100 proves

The installed AUTO BUILDER authority consistently contains:

- canonical `Strategic-Minds/BROWSERWORKER` routing
- connector boot across Drive, GitHub, Vercel, and Supabase
- profit-first mode
- approved-source and existing-preview fast lanes
- 99.00% visual parity requirement
- 100% scoped operational acceptance requirement
- desktop, tablet, and mobile evidence
- five-cycle repair loop
- Vercel Workflow five-minute heartbeat
- explicit production approval gate
- evidence labels, implementation receipt, and rollback receipt

## What 100/100 does not prove

It does not prove that a specific deployed application visually matches an approved image. That requires a target preview, approved visual reference, BrowserWorker screenshots, operational acceptance tests, and recursive repair evidence.

## Run

```bash
node sandbox/profit-browserworker-100/validate.mjs
```

The validator prints a JSON scorecard and exits non-zero unless the score is exactly 100.
