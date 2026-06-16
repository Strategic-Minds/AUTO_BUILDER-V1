# 24/7 Operations Runbook

Status: active repo mirror
Last updated: 2026-06-16
Full Drive canon: https://drive.google.com/file/d/1csO0lIJPmmu9iE_qM9dx0yB2rakaHOmx/view

## Executive Summary

This runbook defines how a recursive governance agent should keep Eden Skye Studios and AUTO_BUILDER healthy around the clock. The system should not claim true 24/7 autonomy unless scheduled execution, monitoring, alerting, receipts, and recovery paths are installed and verified.

Operating principle: detect, label, self-heal if safe, queue if gated, escalate if required, and always leave a receipt.

## Service Expectations

| Area | Target expectation |
|---|---|
| Health checks | Hourly when scheduler exists |
| Canon drift check | Daily |
| Queue review | Daily |
| Financial anomaly review | Daily or weekly depending on verified volume |
| Changelog review | Weekly |
| Deep governance audit | Monthly |

## Incident Levels

| Level | Definition | Response |
|---|---|---|
| L0 Info | Observation only | Log if useful |
| L1 Drift | Docs, links, indexes, or mirrors out of sync | Auto-fix if non-destructive, then log receipt |
| L2 Blocker | Missing access/doc, failed route, stale state | Try safe workaround, queue next step, log blocker |
| L3 Revenue-path risk | Checkout, offer, membership, lead capture, or conversion risk | Stop scaling, report risk, queue fix |
| L4 Protected-system risk | Production, payments, Shopify, Supabase, secrets, destructive ops | Do not self-execute, escalate for approval |
| L5 Critical integrity risk | Source-truth corruption, security, data loss, irreversible risk | Freeze protected actions, preserve evidence, escalate |

## Safe Self-Heal Actions

Allowed: re-run read-only checks, create missing non-authority docs, update indexes, fix stale doc links, add drift reports, add changelog notes, create validation reports, draft approval packets, rebuild draft plans from canon inputs.

Blocked without approval: production deploy, Shopify mutation, payment/pricing/discount/subscription/refund/payout, public publishing, live avatar/video action, Supabase production write, Drive sharing/delete/parent change/destructive move, destructive GitHub write/merge/force push/delete, secret or permission change.

## Receipt Requirements

Every material action needs at least one receipt: Drive file URL, GitHub commit SHA, connector response, Vercel preview/failure response, Supabase row/migration/blocker, Shopify object/blocker, sheet row/range, changelog entry, or validation report.

## Daily Runbook

1. Check Auto Builder MCP health and operating map.
2. Check Eden and Auto Builder repo canon docs.
3. Check Drive canon required documents.
4. Review queue and blockers.
5. Review failed checks/workflows if available.
6. Review revenue-path health if verified sources exist.
7. Update drift report or changelog if needed.
