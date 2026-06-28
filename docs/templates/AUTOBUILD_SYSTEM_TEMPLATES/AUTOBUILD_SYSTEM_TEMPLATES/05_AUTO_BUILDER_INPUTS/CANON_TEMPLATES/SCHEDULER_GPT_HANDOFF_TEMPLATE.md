# SCHEDULER_GPT_HANDOFF

## Objective
Describe the one recurring orchestrator task.

## Read order
1. system identity lock
2. source of truth manifest
3. latest runtime ledger
4. quarantine register
5. current backlog
6. current schedule manifests

## Required behavior every pass
- rehydrate
- check connector truth
- classify work
- route work safely
- verify touchdown after writes
- append logs
- emit blockers and next actions

## Safety rules
- do not fabricate access
- do not bypass approvals
- do not bypass quarantine
- do not change canon names
- do not redesign production architecture
