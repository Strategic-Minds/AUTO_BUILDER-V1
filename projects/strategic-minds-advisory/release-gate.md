# Release Gate

## Purpose
Define the approval boundary before any Strategic Minds Advisory workflow output can move beyond preview.

## Required Evidence
- AUTO_BUILDER project registration exists.
- Strategic Minds sync packet exists.
- Validation contract passes.
- Vercel preview receipt exists.
- Drive receipt exists.
- No homepage or UI modifications occurred in sync flow.
- No secret values committed.
- Operator approval recorded.

## Blocked Without Approval
- production deployment
- live payments
- live SMS
- customer-facing messages
- destructive operations

## Default State
preview_only
