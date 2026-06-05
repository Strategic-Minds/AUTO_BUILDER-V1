# AUTO BUILDER Top 3 Benchmarks

## VERIFIED
1. LangGraph: benchmark for durable graph workflows, checkpointing, human-in-loop pauses, replay, and recovery.
2. OpenAI Agents SDK: benchmark for agents, tools, handoffs, guardrails, streaming, and tracing.
3. Vercel AI SDK / Agents: benchmark for Next.js-native AI routes, tools, streaming UX, and preview-first operator surfaces.

## INFERRED
- Best replica uses LangGraph-style state, OpenAI-style guardrails/tracing, and Vercel-style UI/API surfaces.
- AUTO BUILDER should be a governed state machine with agents as bounded contracts, not freeform automation.

## COULD NOT VERIFY
- Whether these are already implemented in Jeremy's live systems.

## BLOCKERS
- No runtime integration approved.

## WORKAROUNDS
- Encode patterns as docs/contracts/stubs only.

## NEXT ACTIONS
- Validate benchmark-to-contract mapping in the morning.
