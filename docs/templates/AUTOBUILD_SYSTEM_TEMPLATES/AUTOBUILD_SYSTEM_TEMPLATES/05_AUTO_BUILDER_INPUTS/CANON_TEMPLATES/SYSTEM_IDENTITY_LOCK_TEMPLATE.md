# SYSTEM_IDENTITY_LOCK

## Canonical names preserved exactly
- system_1:
- system_2:
- system_3:
- control_plane:
- staging_surface:
- final_write_surface:

## Production identity rules
- do not rename systems during production
- do not redesign architecture during production
- only approved variable-control artifacts may change routine operating variables
- preserve append-only ledgers and logs

## Allowed routine changes
- prompts
- schedules
- quotas
- routing
- thresholds

## Approval-required changes
- schema changes
- connector swaps
- new write destinations
- destructive migrations
