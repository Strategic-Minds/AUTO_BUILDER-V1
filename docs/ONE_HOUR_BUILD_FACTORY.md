# One-Hour Build Factory

## Purpose
Install the repeatable execution factory for AUTO BUILDER:

`idea intake -> route -> template assembly -> sandbox build -> tests -> deploy gate -> learning loop`

This factory is designed for high-frequency use. The target operating mode is up to 50 idea triages per day, with one-hour build packets for standard routes and governed releases for anything that touches live systems.

## Canonical runtime layers
- Runtime shell: Next.js on Vercel
- State and queues: Supabase
- Repo and code promotion: GitHub
- Code generation and patching: GPT and Codex
- Browser validation: Playwright
- Commerce source truth: Shopify
- Creative and publishing: Xyla and Opus when available
- Governance: approval queue, rollback, hardening pipeline, and evidence logging

## Fast-path routes
- Lead magnet funnel
- Client dashboard
- Shopify growth app
- AI voice workflow
- Content engine
- Internal agent
- SaaS MVP
- Attribution ledger
- Automation bridge
- Research or intelligence system

## Canonical build packet contract
Every one-hour build packet must include:
1. Idea brief
2. Classification
3. Economic case
4. Architecture
5. Template bundle
6. Repo plan
7. Supabase plan
8. Workflow plan
9. QA plan
10. Release plan

## First template packs
- Landing and lead capture
- Auth dashboard
- AI agent console
- Workflow queue runner
- Financial forecast panel

## One-hour standard
The factory may move at one-hour speed only when:
- route confidence is high enough or escalation is clean
- matching template packs exist
- required schema and queues already exist or are module-reusable
- hardening profile is defined before release
- rollback path exists

## Hard stop rules
Do not auto-release live systems when the build touches:
- production deployments
- payments or spend
- irreversible writes
- external messages or publishing
- legal or compliance-sensitive claims
- credentials or environment changes

## Current readiness
The factory is installed as a scaffold, not yet as a fully operational live system. Use the readiness and capability endpoints before claiming one-hour eligibility for a route.

## Core endpoints
- `/api/factory/readiness`
- `/api/factory/router`
- `/api/factory/build-packet`
- `/api/factory/capability-test`
- `/api/factory/reverse-engineering`
- `/api/cron/factory-readiness`
- `/api/cron/reverse-engineering-passive`
