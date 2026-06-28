# Operations and Recovery Template

## Continuous operation goals
- heartbeat present
- scheduler continuity preserved
- fallback path available
- run state append-only
- blocked work isolated
- recovery fast and explicit

## Operational safeguards
- connector truth check at task start
- retry policy for transient errors
- quarantine policy for ambiguous errors
- touchdown verification after writes
- backup export before high-risk changes
- nightly summary and blocker digest

## Failure classes
### Transient
- temporary connector issue
- timeout
- rate limit

### Recoverable
- mapping drift
- schema drift
- malformed payload
- stale cursor

### Human-required
- missing account permissions
- billing limit
- policy conflict
- unclear business rule

## Runbook sections
- how to pause scheduler
- how to resume scheduler
- how to clear a stuck queue
- how to restore last safe state
- how to reprocess quarantined work
- how to switch to fallback write path
