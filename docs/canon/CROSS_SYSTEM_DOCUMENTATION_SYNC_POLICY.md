# Cross-System Documentation Sync Policy

Status: active repo mirror
Last updated: 2026-06-16
Full Drive canon: https://drive.google.com/file/d/1D3x4umKyhUw-jW6ygM0AYK1nny2Vm1PY/view

## Executive Summary

This policy defines when Drive, EDENSKYESTUDIOS, and AUTO_BUILDER must be updated together. It prevents Drive canon references, repo source-truth files, and active operating maps from pointing to different locations or incomplete plans.

Rule: if a change affects future agents, business strategy, governance, financial rules, automation behavior, approval gates, system ownership, or launch operations, it must be reflected in the appropriate Drive and repo surfaces before the work is called complete.

## Sync Triggers

Update docs when any of these change:

- Source-truth folder or repo ownership.
- Business model, offer stack, pricing logic, or revenue path.
- Financial rules, KPIs, budgets, forecasts, thresholds, or spend guardrails.
- Automation, cron, queue, bridge, or self-heal behavior.
- Approval gates or protected mutation rules.
- Shopify/Vercel/Supabase/GitHub/Drive integration behavior.
- Launch roadmap, release gate, production status, or validation standard.
- New major file, folder, doc, route, workflow, or operating process.
- Discovery results that change strategy.
- Incident, recovery, or recurring blocker pattern.

## Mirror Rules

1. `docs/canon/` is the repo mirror location for cross-system planning docs.
2. Drive remains the human-facing canon for business and strategy work products.
3. Repos remain the source-controlled canon for agent-operable docs.
4. If Drive and repo versions differ, compare update dates and source evidence.
5. If uncertain, preserve both and create a drift report rather than overwriting.
6. Do not delete or move Drive files destructively without explicit approval.
7. Do not rewrite authority files unless current-session instruction authorizes the exact change.

## Drift Scan Checklist

- Required canon docs exist in Drive.
- Required canon docs exist in both repos.
- README/source-truth docs reference current Drive and repo ownership.
- Changelogs record material changes.
- Approval gates match across Drive, EDENSKYESTUDIOS, and AUTO_BUILDER.
- No old folder is described as primary when the active operating map says otherwise.
- Stubs are not mistaken for complete plans.

## Auto-Fix Rules

Agents may auto-fix missing `docs/canon/` mirrors, missing non-authority Drive Markdown docs, broken internal doc references, stub docs, changelog entries for their own actions, master index entries, and drift reports.

Agents must queue or request approval for authority-file changes not explicitly requested, Drive parent/share/delete/destructive moves, production-affecting changes, destructive GitHub changes, Shopify, Stripe/payment, Supabase production, and public publishing changes.
