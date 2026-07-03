# AUTO BUILDER Prompt Library

This directory is the canonical prompt system for governed autonomous build, validation, packaging, and handoff operations.

## Purpose
- Provide a single indexed prompt library for autonomous build execution.
- Preserve prompt taxonomy, prompt versions, and prompt logging conventions.
- Keep all high-leverage automation prompts repo-grounded and receipt-backed.

## Canonical Roles
- `master-prompt-outline.md`: defines the library operating model and promotion rules.
- `taxonomy.yaml`: defines prompt categories, phases, and trigger conditions.
- `index.json`: maps prompt ids to files, tags, versions, and status.
- `logging.md`: defines how prompt execution and implementation logs are written.
- `missing-pieces.md`: records the explicit capability gaps the system still needs.
- `prompts/`: contains executable prompt artifacts for the AUTOBUILDER control plane.

## Design Rules
1. One prompt = one explicit operating purpose.
2. Every prompt must name its inputs, outputs, safety gates, and validation expectations.
3. Every prompt must be versioned.
4. Every prompt must have a stable prompt_id.
5. Every prompt must reference the master execution contract when it exists.
6. Every implementation or automation prompt must require receipts.
7. No prompt may authorize production deploys, secrets, or protected writes without explicit approval gates.

## Coverage Standard
The library must cover:
- source of truth and governance
- phase/step control
- agent routing
- workflow and cron orchestration
- validation and browser checks
- receipt logging
- handoff and resume behavior
- packaging and leadership summary
- self-audit and self-heal
- prompt maintenance and taxonomy updates
- gap closure for missing upstream capabilities

## Handoff Rule
Any prompt that changes system behavior must end with a resume pointer, next action, and validation requirement.
