# SYNC CONTRACT — QA-SUITE
# AUTO_BUILDER :: sync-orchestrator/agents/qa-suite.md
# Batch: 3 | System: hybrid | Status: active
# Last synced: 2026-06-26 | Owner: sync-orchestrator

---

## IDENTITY
- **Agent ID:** qa-suite
- **Display Name:** SM Test Suite
- **System:** hybrid
- **Domain:** quality
- **Role Type:** tool
- **Autonomy Level:** L4
- **Status:** active
- **Reports To:** validator
- **Deputies:** None

## SOUL STATEMENT
> TBD — pending ingestion

## CAPABILITIES
  - 31-persona library
  - 36-section test suite
  - automated scoring
  - Supabase persistence
  - Drive reporting

## SOURCE
- **Repo:** Strategic-Minds/sm-qa-agent
- **Vercel:** https://sm-qa-agent.vercel.app
- **MCP:** N/A
- **Base44 ID:** N/A
- **Drive:** N/A

## TAGS
qa, testing, personas

## CHANNELS (primary)
See agent_subscriptions WHERE agent_id = 'qa-suite'

## SYNC CHECKLIST (run each sync cycle)
- [ ] Read from agent_registry WHERE agent_id = 'qa-suite'
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
