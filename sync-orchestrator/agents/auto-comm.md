# SYNC CONTRACT — AUTO-COMM
# AUTO_BUILDER :: sync-orchestrator/agents/auto-comm.md
# Batch: 3 | System: hybrid | Status: active
# Last synced: 2026-06-26 | Owner: sync-orchestrator

---

## IDENTITY
- **Agent ID:** auto-comm
- **Display Name:** Auto Comm — WA Lead Gen
- **System:** hybrid
- **Domain:** communications
- **Role Type:** lead
- **Autonomy Level:** L4
- **Status:** active
- **Reports To:** aria
- **Deputies:** None

## SOUL STATEMENT
> TBD — pending ingestion

## CAPABILITIES
  - WhatsApp automation
  - lead capture
  - Base44 coordination
  - Twilio bridge
  - conversation management

## SOURCE
- **Repo:** N/A
- **Vercel:** N/A
- **MCP:** N/A
- **Base44 ID:** N/A
- **Drive:** N/A

## TAGS
whatsapp, lead-gen, comms

## CHANNELS (primary)
See agent_subscriptions WHERE agent_id = 'auto-comm'

## SYNC CHECKLIST (run each sync cycle)
- [ ] Read from agent_registry WHERE agent_id = 'auto-comm'
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
