# Conflict Report

## Summary

AUTO BUILDER OS v1.0 has strong source-truth alignment at the document and route level, but it is not merge-ready as a unified autonomous operating system. The main conflict is not concept direction. The conflict is branch drift, connector readiness mismatch, and production-governance risk.

## Verified Conflicts

1. Bridge PR drift: PR #13 (`auto-builder/autonomous-bridge-suite-20260606`) is diverged from `main`, observed ahead by 52 commits and behind by 27 commits. It should not merge until rebased or reconstructed against current main.
2. v0 frontend drift: the bridge command-center PR and the newer v0 AUTO BUILDER OS UI work are on different branches/deployments. The frontend is not yet verified as bidirectionally synced with the latest backend OS routes.
3. Slack versus Google Chat: live readiness data still lists Slack as an approval/escalation connector. The user decision is Google Chat, so Slack must be replaced in connector maps, docs, env names, and UI copy.
4. Supabase safety: advisors reported many tables with RLS enabled but no policy, function search-path warnings, and public/signed-in execution risk on a security-definer function. This blocks connector widening and production schema merges.
5. Runtime status versus factory readiness: `/api/bridge/providers/runtime-status` shows some provider readiness as true, while `/api/factory/readiness` still reports factory readiness score 47 and connector readiness blockers.
6. AUTO_BUILDER 2 file map mismatch: the bridge summary listed `factory/connector-ops.json` and `factory/capability-matrix.json`, but GitHub main fetches for those exact files returned 404 in the audit pass.
7. Cron policy gap: current `vercel.json` contains 5-minute crons for recursive/social routes and other scheduled routes. The OS spec requires 5-minute cron safety policy and non-mutating/default-safe behavior to be explicit per route.
8. AI Gateway evidence gap: the OS spec requires AI Gateway routing/cost tracking, but no live route or file evidence proved that it is installed end to end.
9. n8n evidence gap: n8n is part of the required external workflow layer, but no verified route, env status, or workflow receipt proved operational integration.
10. Vercel Agents evidence gap: required agents are specified in the OS docs, but no verified Vercel Agent manifests or runtime receipts proved installation.

## Merge Risk

- PR #13 contains useful bridge/generator/event-bus work, but it overlaps with main's newer Eden universal runtime bridge work and Vercel cron changes.
- v0 PR #1 contains useful command-center UI, but it must be reconciled with the latest v0 branch that renamed and evolved the AUTO BUILDER OS frontend.
- Supabase migration work must land first in a branch/sandbox and pass RLS/security advisor review before production.

## Resolution Order

1. Freeze source truth on current `main` plus the two OS docs.
2. Reconstruct PR #13 into a fresh branch from current main, or rebase it with explicit conflict review.
3. Replace Slack connector assumptions with Google Chat.
4. Apply Supabase fixes in a development branch only.
5. Reconcile v0 UI against the current v0 OS branch after backend route contract is stable.
6. Run smoke and screenshot evidence before merge.
