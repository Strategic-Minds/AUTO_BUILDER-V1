# Prompt Library Master Outline

## Role
This document is the master specification for the AUTO BUILDER prompt library.
It defines how prompts are named, organized, indexed, logged, validated, resumed, and retired.

## Scope
The library must cover:
- forensic audit prompts
- master execution prompts
- validation prompts
- packaging and handoff prompts
- gap-closure prompts
- maintenance and taxonomy prompts

## Ownership Rules
1. `master-prompt-outline.md` owns the prompt library operating model.
2. `taxonomy.yaml` owns the classification schema.
3. `index.json` owns the machine-readable prompt registry.
4. `logging.md` owns execution logging rules.
5. `prompts/` owns executable prompt content.

## Required Prompt Fields
Every prompt must define:
- `prompt_id`
- title
- version
- status
- target phase
- safety gates
- required inputs
- expected outputs
- validation expectations
- resume pointer

## Execution Standard
A prompt is valid only if it:
- is repo-grounded
- respects branch-safe limits
- produces receipts where automation is involved
- states the next action clearly
- names the blocker if completion is not possible

## Lifecycle
Prompts move through:
- draft
- active
- deprecated
- retired

## Promotion Rule
A prompt cannot become active until its index entry exists and its file passes the prompt library validator.

## Retirement Rule
Retired prompts must remain in the library for traceability, but must be marked inactive in the index.
