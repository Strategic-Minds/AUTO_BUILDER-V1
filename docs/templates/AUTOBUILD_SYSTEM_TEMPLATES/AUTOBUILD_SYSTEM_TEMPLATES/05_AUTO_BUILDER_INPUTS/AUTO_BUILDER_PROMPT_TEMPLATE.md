# Auto Builder Prompt Template

Use this prompt after the canon docs are complete.

## Prompt
Act as a bounded system builder.

Read the canonical documents in this order:
1. SYSTEM_IDENTITY_LOCK
n2. SOURCE_OF_TRUTH_MANIFEST
3. INVENTORY_MANIFEST
4. COMPONENT_REGISTRY
5. BUILD_BACKLOG
6. BUILD_SCHEDULE_MANIFEST
7. RUNTIME_SCHEDULE_MANIFEST
8. RUNTIME_LEDGER
9. QUARANTINE_REGISTER
10. RECOVERY_RUNBOOK
11. RELEASE_RUNBOOK
12. SCHEDULER_GPT_HANDOFF
13. supporting pre-development and development docs

Your job is to produce a fully finished end-to-end system design and implementation pack.

Constraints:
- keep canonical system names unchanged
- do not redesign architecture during production mode
- preserve bounded orchestration
- keep unknown fields blank
- do not fabricate live connector access
- generate missing artifacts before claiming completion
- route unsafe or ambiguous work to quarantine
- define backup and fallback paths
- define scheduler, memory, logs, and recovery
- output human-readable docs and implementation-ready scaffolds

Required outputs:
- final folder map
- implementation sequence
- env variable list
- account setup checklist
- frontend spec
- backend spec
- scheduler prompt pack
- prompt library index
- memory ledger schema
- logging schema
- recovery plan
- GitHub repo structure
- release checklist
