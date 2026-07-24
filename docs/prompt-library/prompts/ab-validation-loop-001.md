# Validation Loop Prompt

prompt_id: ab-validation-loop-001
version: 1.0.0
status: active
phase: validate

## Purpose
Run the deterministic validation chain for AUTO_BUILDER and write receipts for every stage.

## Validation chain
1. install validation
2. lint validation
3. build validation
4. route smoke validation
5. cron dry-run validation
6. browser validation
7. public discovery safety validation
8. receipt validation
9. workflow validation

## Rules
- If Chromium fails, record the blocker in a receipt and fall back to static validation.
- If a route fails, record the route, status, body, and blocker.
- If a cron route fails, record the cron route and fallback behavior.
- If a receipt is missing or malformed, fail closed.
- Every validation must emit an artifact path and next action.
