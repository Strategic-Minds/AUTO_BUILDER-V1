# Canonical Domain And Active Proof Build

## Status

`https://autobuilderos.com` is the canonical AUTO BUILDER OS frontend/control-plane domain unless a newer verified repo/Drive/Supabase/Vercel record supersedes it.

## Active Proof Build

Nashville Resin Works is the current active live proof build for the end-to-end AUTO BUILDER OS workflow.

The operator reports that v0 is actively using the workflow through `autobuilderos.com` while operating/programming the Nashville Resin Works website.

## Required Agent Rehydration Rule

Every agent that signs on to AUTO BUILDER OS must know:

- `autobuilderos.com` is the operator-facing control-plane domain.
- Vercel preview URLs are validation/build surfaces, not the canonical operator domain.
- v0 is the frontend/control-plane lane.
- AUTO BUILDER remains the orchestration brain.
- Vercel Workflow/Sandbox/GitHub Actions/Supabase queues are the execution layer.
- Nashville Resin Works is the current proof build until superseded.

## Verification Required Before Claims

Before claiming the system is healthy, verify:

1. `autobuilderos.com` loads the expected control plane.
2. `/bridge` loads the gated approval center.
3. `/agent-bridge` loads the orchestrator chat/control surface.
4. `/analytics` loads live metrics or clearly labels mock/sample data.
5. Supabase receipts exist for workflow actions.
6. Vercel deployment for the domain is healthy.
7. GitHub branch/commit aligns with the active frontend.
8. Drive source docs agree with the current workflow.
9. Nashville Resin Works evidence exists for the active proof build.

## Governance

Do not bypass gates because the domain is live.

Production deploys, production database writes, secret/env changes, Shopify/Stripe/payment actions, live social publishing, customer messages, destructive actions, and capital spend still require explicit operator approval and receipts.
