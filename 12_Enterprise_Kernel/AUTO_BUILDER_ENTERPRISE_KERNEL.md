# AUTO_BUILDER Enterprise Kernel

The kernel is the master control-plane contract for the full company operating system.

## Kernel modules
- request classifier
- phase gate controller
- source truth resolver
- agent registry resolver
- tool permission resolver
- workflow scheduler
- template registry selector
- Drive destination resolver
- Supabase schema resolver
- QA/eval policy resolver
- receipt writer
- rollback resolver
- approval router
- license entitlement resolver
- release train resolver

## Kernel event lifecycle
1. intake_received
2. request_classified
3. source_truth_required
4. discovery_completed
5. route_selected
6. docs_required
7. scaffold_requested
8. validation_requested
9. receipt_written
10. approval_requested
11. release_blocked_or_allowed

## Blocking rule
If any event cannot produce a receipt, stop and mark BLOCKER.
