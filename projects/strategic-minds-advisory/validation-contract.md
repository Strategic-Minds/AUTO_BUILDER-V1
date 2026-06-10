# Validation Contract

## Purpose
Define validation requirements for AUTO_BUILDER output targeting Strategic Minds Advisory.

## Required Checks
1. Target branch is feature/auto-builder-sync.
2. No homepage files changed.
3. No UI files changed.
4. No main branch write occurred.
5. No secret values are committed.
6. No production deployment is triggered.
7. No live SMS is sent.
8. No live payment is processed.
9. Vercel preview or workflow receipt exists before promotion.
10. Drive receipt exists before promotion.

## Result Fields
- project
- repo
- branch
- status
- changed_files
- receipts
- blockers
- production_ready

## Status Rules
- pass means all checks passed.
- warning means non-blocking evidence is missing.
- fail means release is blocked.

## Default
production_ready is false until operator approval exists.
