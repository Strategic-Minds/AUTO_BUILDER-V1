# SYNC CONTRACT — SYNC-ORCHESTRATOR
# AUTO_BUILDER :: sync-orchestrator/agents/sync-orchestrator.md
# Batch: 3 | System: hybrid | Status: active
# Last synced: 2026-06-26 | Owner: sync-orchestrator

---

## IDENTITY
- **Agent ID:** sync-orchestrator
- **Display Name:** Base44 Sync Orchestrator
- **System:** hybrid
- **Domain:** orchestration
- **Role Type:** orchestrator
- **Autonomy Level:** L5
- **Status:** active
- **Reports To:** apex
- **Deputies:** None

## SOUL STATEMENT
> TBD — pending ingestion

## CAPABILITIES
  - Base44-AWOS bridge
  - idempotency routing
  - task queue
  - receipt normalization
  - cross-system state sync

## SOURCE
- **Repo:** N/A
- **Vercel:** N/A
- **MCP:** https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp-extended
- **Base44 ID:** N/A
- **Drive:** N/A

## TAGS
hybrid, sync, bridge

## CHANNELS (primary)
See agent_subscriptions WHERE agent_id = 'sync-orchestrator'

## SYNC CHECKLIST (run each sync cycle)
- [ ] Read from agent_registry WHERE agent_id = 'sync-orchestrator'
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
