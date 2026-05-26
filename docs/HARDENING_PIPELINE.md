# Hardening Pipeline

## Purpose
Provide the operational release gate for the one-hour build factory.

## Required checks
1. Schema migration dry run
2. RLS audit
3. Backend route smoke
4. Frontend render smoke
5. Queue replay and idempotency
6. Dead-letter handling
7. Approval gate test
8. Preview smoke
9. Rollback reference exists
10. Secrets scan

## Preview validation workflow
This repo now includes `.github/workflows/preview-validation.yml`.

It runs:
- `npm install`
- `npm run validate:factory`
- `npm run build`

## Decision doctrine
- Any required failure blocks release.
- If a required check cannot run, the system must return a blocker plus fallback path.
- Hardening does not stop at "failed"; it should also return the exact patch list needed for the next pass.

## Evidence expected
- migration log
- RLS report
- route report
- screenshots
- receipt log
- dead-letter log
- approval record
- preview receipt
- rollback runbook
- scan report
