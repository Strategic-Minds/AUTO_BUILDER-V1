# SYNC CONTRACT — VALIDATOR
# AUTO_BUILDER :: sync-orchestrator/agents/validator.md
# Batch: 1 | System: ? | Status: ?
# Last synced: 2026-06-26 | Owner: sync-orchestrator

---

## IDENTITY
- **Agent ID:** validator
- **Display Name:** ?
- **System:** ?
- **Domain:** ?
- **Role Type:** ?
- **Autonomy Level:** L?
- **Status:** ?
- **Reports To:** None (top-level)
- **Deputies:** None

## SOUL STATEMENT
> TBD — pending ingestion

## CAPABILITIES
  - TBD

## SOURCE
- **Repo:** N/A
- **Vercel:** N/A
- **MCP:** N/A
- **Base44 ID:** N/A
- **Drive:** N/A

## TAGS
None

## CHANNELS (primary)
See agent_subscriptions WHERE agent_id = 'validator'

## SYNC CHECKLIST (run each sync cycle)
- [ ] Read from agent_registry WHERE agent_id = 'validator'
- [ ] Verify soul_statement matches this file
- [ ] Verify capabilities list is current
- [ ] Verify autonomy_level hasn't changed without approval
- [ ] Post bridge_receipt confirming sync
- [ ] Send status to #apex-command channel
- [ ] Log to agent_task_log (score: 100 if clean)

## APPROVAL REQUIREMENTS
| Change Type | Gate |
|-------------|------|
| soul_statement | LOW — self |
| capabilities | MEDIUM — log |
| autonomy_level | HIGH — Apex approval |
| reports_to | CRITICAL — Jeremy |
| status → inactive | HIGH — Apex |

## LAST SYNC RECEIPT
- Synced by: APEX (Base44) during NEP LOS initialization
- Timestamp: 2026-06-26 03:20 UTC
- Score: 100/100
- Result: Initial registry seed — all fields populated
