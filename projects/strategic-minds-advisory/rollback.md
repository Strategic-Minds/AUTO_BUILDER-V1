# Rollback Contract

## Triggers
- validation failure
- missing receipts
- unsafe file changes
- unexpected production activity
- secret exposure

## Actions
1. Keep production untouched.
2. Stop promotion beyond preview.
3. Mark workflow blocked.
4. Require operator review.
5. Preserve receipts for audit.

## Safe Default
If evidence is missing, rollback state remains active and release remains blocked.
