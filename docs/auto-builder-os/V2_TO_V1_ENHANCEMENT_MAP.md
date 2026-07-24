# V2 to V1 Enhancement Map

Date: 2026-07-03
Status: branch-safe documentation and validation enhancement

## Purpose

This map records the selective AUTOBUILDER-V2 material being moved into AUTO_BUILDER-V1. V1 remains the active operating brain. V2 is a reference source for cleaner registry specs, cron contracts, and validator language.

## Source Truth

- Active runtime target: `Strategic-Minds/AUTO_BUILDER-V1`
- Reference source: `Strategic-Minds/AUTOBUILDER-V2` PR #1
- Live Supabase project: `prhppuuwcnmfdhwsagug`
- Protected behavior: no production deployment, no live Supabase mutation, no secret changes, no live customer/social actions, no destructive actions

## What Was Ported

| V2 concept | V1 destination | Adaptation |
|---|---|---|
| Control plane registry | `docs/registries/control-plane-registry.json` | Names V1 as the active operating brain and maps registry names to V1/Supabase table concepts. |
| GPT bridge registry | `docs/registries/gpt-bridge-registry.yaml` | Points to V1 strict MCP, Supabase MCP, GitHub, Drive, Vercel, and Base44/APEX bridge boundaries. |
| Prompt library | `docs/registries/prompt-library.yaml` | Keeps reusable prompt families while aligning phases to V1 source-truth and governance. |
| Queue lifecycle | `docs/registries/queue-lifecycle.yaml` | Maps lifecycle states to `task_queue`, `bridge_receipts`, `approval_gate`, and `agent_task_log`. |
| Validation scorecard | `docs/registries/validation-scorecard.yaml` | Adds registry parse, route parity, Supabase runner, protected gate, and receipt checks. |
| Vercel cron spec | `docs/registries/vercel-cron-spec.yaml` | Keeps V1 existing cron routes as active and records V2 cron ideas as docs-only proposed contracts. |

## What Was Not Ported

- V2 cron route code was not copied into V1.
- V1 MCP and Supabase execution code was not replaced.
- No Vercel cron was activated.
- No Supabase migration or live write was performed.
- No Drive, Vercel, production, customer, social, DNS, payment, or secret mutation was performed.

## Why This Enhances V1

V1 already has the stronger runtime and source-truth architecture. The missing layer is a clean set of machine-readable manifests that validators, agents, and future automation can parse. These files make V1 easier to validate and coordinate without weakening the existing control plane.

## Validation Expectations

`scripts/validate-factory.mjs` should verify:

- all six registry files exist
- JSON registry files parse as JSON
- YAML registry files have required top-level markers
- active V1 cron routes have matching route files
- V2-derived proposed cron contracts remain docs-only until deliberately implemented

## Next Gate

After this branch is reviewed, the next safe enhancement is to wire these registries into dry-run validator output and bridge receipts. Live cron execution and live Supabase writes remain separate protected gates.
