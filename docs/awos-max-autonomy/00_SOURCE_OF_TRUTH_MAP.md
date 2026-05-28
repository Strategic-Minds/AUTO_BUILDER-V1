# AUTO BUILDER Source Of Truth Map

## Authority Order

1. Current user instructions in the active conversation
2. Safety and platform rules
3. Project instructions and repo-local instructions
4. This workbook upload and current filesystem facts
5. AWOS doctrine files
6. AUTO BUILDER memory and continuity docs
7. Templates and fallback builder-doc scaffolds

## Canonical Owners By Domain

- Business and revenue doctrine:
  - `agent_files/awos/MONEY_MACHINE_OPERATING_SYSTEM.md`
- Workbook-derived rationale:
  - `agent_files/awos/MONEY_MACHINE_WORKBOOK_SOURCE_NOTES.md`
- Runtime source hierarchy:
  - `memory/AUTO_BUILDER_Documentation_Set/01_INSTRUCTION_HIERARCHY.md`
- GPT-agent operating identity:
  - `memory/auto-builder-gpt-agent-system-source-truth.md`
- Current active system state:
  - `memory/active-builds.md`
- Commerce truth:
  - `memory/commerce-rules.md`

## Workbook Normalization Rule

The uploaded workbook is the active handoff delta. Its install targets should be materialized as additive repo artifacts, but it should not replace the AWOS doctrine or the AUTO BUILDER hierarchy files.

## Protected Mutation Rule

The system may continuously draft, inspect, route, queue, and validate. It must stop for approval on:

- live deployments
- schema changes
- billing mutations
- live publishing
- mass outreach
