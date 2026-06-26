# SYNC CONTRACT — ADMIN-COMMAND
# AUTO_BUILDER :: sync-orchestrator/agents/admin-command.md
# Batch: 3 | System: hybrid | Status: active
# Last synced: 2026-06-26 | Owner: sync-orchestrator

---

## IDENTITY
- **Agent ID:** admin-command
- **Display Name:** Admin Command Bridge
- **System:** hybrid
- **Domain:** governance
- **Role Type:** tool
- **Autonomy Level:** L5
- **Status:** active
- **Reports To:** ab-governance
- **Deputies:** None

## SOUL STATEMENT
> TBD — pending ingestion

## CAPABILITIES
  - approval gate
  - audit logs
  - rollback
  - command bridge
  - emergency stop

## SOURCE
- **Repo:** N/A
- **Vercel:** N/A
- **MCP:** N/A
- **Base44 ID:** N/A
- **Drive:** N/A

## TAGS
admin, governance, approval

## CHANNELS (primary)
See agent_subscriptions WHERE agent_id = 'admin-command'

## SYNC CHECKLIST (run each sync cycle)
- [ ] Read from agent_registry WHERE agent_id = 'admin-command'
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
