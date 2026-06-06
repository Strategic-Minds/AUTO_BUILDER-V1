# Mandatory Git + Drive + Autonomous GPT Bridge Source Rule

Date: 2026-06-06
Status: MANDATORY LOCKED
Applies to: AUTO BUILDER OS, GPT Business AUTO BUILDER agent, Auto Social, Codex jobs, Vercel Workflow, Vercel Agents, n8n workflows, v0 frontend, bridge workers, and all system-in-a-box builds.

## Rule

AUTO BUILDER must not treat GitHub/repo inspection alone as complete discovery.

For every major idea, implementation, workflow, agent, Auto Social, website, store, backend, frontend, connector, or system build request, AUTO BUILDER must search both:

- GitHub / repo truth: code, docs, issues, PRs, commits, workflows, env examples, branch state, implementation packets, and build evidence.
- Google Drive / source docs: command centers, workbooks, builder docs, operating playbooks, client/project docs, discovery notes, approval records, asset queues, and source-of-truth folders.

Repo-only discovery is incomplete. Drive-only discovery is incomplete. The correct source-of-truth posture is GitHub plus Google Drive, with every missing or inaccessible source marked as Could Not Verify.

## Autonomous GPT Bridge Requirement

AUTO BUILDER must use the autonomous GPT bridge as the default orchestration path for command, event, audit, queue, receipt, and handoff behavior.

The bridge is the preferred path for:

- phase transition events
- discovery/source indexing
- build packet handoffs
- queue writes and receipts
- connector status checks
- smoke-test evidence
- blocker/self-heal records
- frontend/backend synchronization receipts
- Google Chat approval/event notifications when configured
- n8n/Vercel/Supabase/Codex workflow handoffs when configured

If the bridge is unavailable, AUTO BUILDER must document the blocker, use the safest available fallback, and create a bridge-repair TODO before moving forward.

## Discovery TODO Addition

Every Discovery Mode TODO must include:

- [ ] Search GitHub/repo truth.
- [ ] Search Google Drive/source docs.
- [ ] Compare GitHub findings against Drive findings.
- [ ] Mark conflicts, stale docs, missing docs, and source gaps.
- [ ] Use autonomous GPT bridge for command/event/receipt handoff where available.
- [ ] If bridge is blocked, create bridge repair/self-heal TODO.

## Protected Limits

This rule does not authorize production mutation. The following remain gated:

- production deployment
- production database migration
- secret mutation
- live social publishing
- Shopify/Stripe/payment action
- customer messaging
- destructive action
- capital spend

## Frontend And Workflow Requirement

The v0 AUTO BUILDER OS frontend and workflow docs must display or enforce this posture:

- source search requires GitHub plus Google Drive
- bridge status is visible
- bridge receipts are visible
- missing bridge capability is a blocker
- fallback mode is allowed only with an explicit repair TODO

## Acceptance Criteria

A run is not discovery-complete unless it records:

- GitHub searched or could not verify
- Drive searched or could not verify
- bridge used or bridge blocker recorded
- conflicts/gaps recorded
- next source/bridge action identified
