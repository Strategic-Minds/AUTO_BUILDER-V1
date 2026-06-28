# GPT Collaboration Playbook

## Rule 1
Use GPT to generate from docs, not from vague memory.

## Rule 2
Have GPT classify each statement as one of:
- verified
- inferred
- missing
- blocked

## Rule 3
Never ask GPT to build production code before the architecture and data contracts exist.

## Rule 4
Use GPT in this order:
1. discovery synthesis
2. pre-dev docs
3. architecture docs
4. object contracts
5. prompt library
6. scaffolds
7. production hardening
8. release and handoff docs

## Rule 5
When GPT claims something is live, require proof:
- file path
- connector result
- URL
- object id
- environment variable name

## Rule 6
Ask GPT to output:
- assumptions used
- exact files created
- missing inputs
- blockers
- next actions

## Rule 7
Use one bounded orchestrator for recurring work whenever possible.
