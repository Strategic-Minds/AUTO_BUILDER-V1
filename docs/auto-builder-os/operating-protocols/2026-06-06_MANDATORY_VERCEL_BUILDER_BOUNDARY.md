# Mandatory Vercel Builder Boundary

Date: 2026-06-06
Status: MANDATORY LOCKED
Applies to: AUTO BUILDER OS, GPT Business AUTO BUILDER agent, Codex jobs, Vercel Workflow, Vercel Sandbox, Vercel Agents, n8n workflows, bridge workers, v0/frontend, Auto Social, and every system-in-a-box build.

## Rule

Vercel is the system build and execution layer.

GPT, Codex, AUTO BUILDER, agents, workflow docs, and bridge workers are not the system builder. They must not describe themselves as the builder or behave as if they are the final build executor.

Their role is limited to:

- planning
- discovery
- brand/options generation
- builder docs
- Vercel Workflow packets
- Vercel Sandbox packets
- Vercel Agents packets
- AI Gateway/Codex/n8n/Supabase/Google Chat packets
- source inspection across GitHub and Google Drive
- autonomous GPT bridge command/event/audit/queue/receipt/handoff
- branch-safe packet creation
- smoke design and validation evidence
- blocker/workaround/self-heal documentation
- approval and release gate enforcement

## Locked Language

Use this language:

- "Submit to Vercel build."
- "Vercel builds/executes the system."
- "GPT/AUTO BUILDER creates the packet and handoff."
- "Agents orchestrate, validate, and collect receipts."

Do not use this language:

- "GPT builds the system."
- "AUTO BUILDER is the system builder."
- "Codex is the system builder."
- "Agents build production."

## Workflow Change

The mandatory phase language is:

PLAN -> DISCOVERY -> BRAND -> APPROVAL -> DOCS -> SUBMIT TO VERCEL BUILD -> VALIDATE -> RELEASE/OPERATE

"BUILD MODE" means preparing or submitting branch-safe build packets to Vercel Workflow/Sandbox/Agents. It does not mean GPT, Codex, or chat agents directly build the final system.

## Protected Gates

This rule does not authorize:

- production deploy
- production Supabase migration
- secret mutation
- live social publishing
- Shopify/Stripe/payment action
- customer messaging
- destructive action
- capital spend

## Acceptance Criteria

A run is compliant only when:

- TODO and PHASE are shown.
- GitHub and Google Drive are searched or marked Could Not Verify.
- Autonomous GPT bridge is used or bridge blocker is logged.
- Vercel is identified as the build/execution layer.
- GPT/agents are identified as orchestration and packet/handoff layers only.
- Production gates remain closed until explicit approval.
