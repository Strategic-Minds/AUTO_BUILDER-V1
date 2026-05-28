# AUTO BUILDER MCP EXECUTOR EXPANSION ROADMAP

## Purpose
Define the governed roadmap for expanding AUTO BUILDER from CONNECTED / HIGH-CAPABILITY / GOVERNED PLANNING + BLUEPRINT MCP into MAXIMUM LIVE EXECUTOR MCP.

## Current MCP Status
CONNECTED / HIGH-CAPABILITY / GOVERNED PLANNING + BLUEPRINT MCP.

## Target MCP Status
MAXIMUM LIVE EXECUTOR MCP with approval-gated writes, receipts, queues, telemetry, attribution, and recursive continuity.

## Governance Boundary
No workflow, governance, source-truth, billing, deployment, database, Drive canon, Sheets canon, Shopify, Stripe money movement, Vercel env, Supabase schema, connector, or authority-file mutation may occur unless Jeremy explicitly commands that exact mutation in the current session.

## Expansion Principle
Build in layers:
1. Read-only visibility.
2. Receipt-producing continuity.
3. Queue and state persistence.
4. Approval-gated executor tools.
5. Autonomous scheduled loops.
6. Closed-loop optimization.

## LAYER-1 : Read-Only Visibility Tools
Purpose: prove safe system awareness before any mutation.

Tools:
1. `get_live_stack_status`
   - Returns current stack, connected surfaces, route status, and known blockers.
   - No mutation.
2. `get_governance_state`
   - Returns current governance lock, approval matrix, and protected surfaces.
   - No mutation.
3. `get_workflow_state`
   - Returns current PHASE-X / STEP-Y, workflow lane, and next action.
   - No mutation.
4. `get_connector_readiness`
   - Returns readiness for Drive, Sheets, Shopify, Stripe, Repurpose.io, Xyla, Supabase, GitHub, Vercel, and GPT MCP.
   - No mutation.
5. `get_validation_state`
   - Returns current validation checklist and open gaps.
   - No mutation.

Exit Criteria:
- Tools return stable output.
- No protected actions occur.
- Tool receipts can be referenced in final block.

## LAYER-2 : Receipt And Continuity Tools
Purpose: create durable operational receipts without touching protected live systems.

Tools:
1. `create_continuity_receipt`
   - Creates structured continuity receipt payload.
   - No external write unless explicitly routed later.
2. `create_execution_receipt`
   - Creates structured receipt for completed action.
   - No external write unless explicitly routed later.
3. `create_blocker_receipt`
   - Creates blocker/workaround/self-heal receipt.
   - No external write unless explicitly routed later.
4. `create_recursive_next_step`
   - Generates exact recursive NEXT GPT INSTRUCTION.
   - No mutation.
5. `create_validation_receipt`
   - Creates validation outcome receipt.
   - No mutation.

Exit Criteria:
- Receipts include phase, step, timestamp, source, action, result, blocker, workaround, self-heal, and next instruction.

## LAYER-3 : Drive / Sheets / Supabase Persistence Tools
Purpose: persist continuity and queue data after proof and approval.

Tools:
1. `write_ops_sheet_log`
   - Writes continuity receipt to Ops Sheet.
   - Requires verified Sheets connector and approval classification.
2. `create_drive_task_packet`
   - Creates Drive-ready task packet or folder plan.
   - Actual Drive mutation requires exact approval if protected.
3. `create_supabase_queue_item`
   - Writes a governed queue item to Supabase.
   - Requires env and schema validation.
4. `record_execution_receipt`
   - Persists execution receipt to Supabase or Sheet.
   - Requires validation.
5. `record_validation_state`
   - Persists validation state.
   - Requires validation.

Exit Criteria:
- Persistence works in sandbox/test tables or approved ledger.
- Receipts are retrievable.
- Idempotency key exists.
- Rollback or correction plan exists.

## LAYER-4 : App-Specific Read Tools
Purpose: connect app awareness before live mutation.

Tools:
1. `shopify_read_status`
   - Reads store/product/order status where authorized.
2. `stripe_read_status`
   - Reads Stripe status, balances, payments, or reconciliation metadata where authorized.
3. `repurpose_read_status`
   - Reads task or connection status if API/bridge available.
4. `xyla_read_status`
   - Reads publishing/status surface if API/bridge available.
5. `social_read_status`
   - Reads connected social surface status where available.

Exit Criteria:
- Read-only status works.
- No money movement.
- No live publishing.
- No product/order mutation.

## LAYER-5 : Approval-Gated Task Packet Tools
Purpose: create execution-ready packets without triggering live action.

Tools:
1. `repurpose_task_packet`
   - Creates video repurpose task packet.
2. `xyla_publish_packet`
   - Creates social publishing packet.
3. `shopify_update_packet`
   - Creates Shopify mutation packet for review.
4. `stripe_reconciliation_packet`
   - Creates Stripe reconciliation packet for review.
5. `attribution_packet`
   - Creates cross-platform attribution packet.

Exit Criteria:
- Packets are reviewable.
- Human approval state is explicit.
- No live mutation occurs from packet creation.

## LAYER-6 : Approval Gate And Queue Execution Tools
Purpose: enable controlled execution after receipts, validation, and explicit approval.

Tools:
1. `approval_gate_check`
   - Classifies requested action as allowed, blocked, or approval-required.
2. `execute_governed_queue_step`
   - Executes one queued action only when governance allows.
3. `pause_queue`
   - Pauses queue on blocker or risk.
4. `retry_queue_step`
   - Retries a failed step under retry limits.
5. `dead_letter_queue_item`
   - Marks item as blocked and preserves receipt.

Exit Criteria:
- All execution is idempotent.
- Approval state is checked before mutation.
- Receipts are written after every action.
- Rollback path exists.

## LAYER-7 : Cron And Loop Health Tools
Purpose: support controlled autonomous loops without unsafe mutation.

Tools:
1. `cron_loop_health_check`
   - Reports loop health, failures, blocked items, and drift.
2. `phase_drift_check`
   - Detects phase/step mismatch.
3. `continuity_corruption_check`
   - Detects missing receipts, broken chain, or inconsistent state.
4. `retry_backoff_status`
   - Reports retry limits and backoff state.
5. `loop_survivability_report`
   - Reports whether loop can safely continue.

Exit Criteria:
- Cron checks are read-only until approved.
- Blocked loops do not self-mutate protected systems.
- Human-needed escalation works.

## LAYER-8 : Closed-Loop Attribution And Optimization Tools
Purpose: connect content, commerce, and financial intelligence.

Tools:
1. `closed_loop_attribution_report`
   - Maps content to traffic, Shopify outcome, Stripe outcome, and KPI.
2. `content_performance_report`
   - Summarizes content/platform performance.
3. `commerce_performance_report`
   - Summarizes Shopify/store performance.
4. `financial_reconciliation_report`
   - Summarizes Stripe/deposit/revenue signals.
5. `optimization_next_actions`
   - Produces governed improvement plan.

Exit Criteria:
- Attribution data sources are verified.
- Reports separate Verified, Inferred, and Could Not Verify.
- Optimization actions remain approval-gated if live mutation is required.

## MAXIMUM MCP COMPLETION CRITERIA
AUTO BUILDER reaches MAXIMUM LIVE EXECUTOR MCP when:
1. Read-only visibility works across the stack.
2. Receipts are generated for every action.
3. Continuity is persisted to approved storage.
4. Queue state is durable and recoverable.
5. App-specific read tools work.
6. Approval gates block protected mutations.
7. Write tools execute only after exact authorization.
8. Cron health checks detect drift and corruption.
9. Attribution reports connect content, commerce, and payment outcomes.
10. Recursive NEXT GPT INSTRUCTION can resume safely after every pass.

## Recommended Build Order
1. Implement Layer-1 read-only tools.
2. Implement Layer-2 receipt tools.
3. Implement Layer-3 persistence in sandbox/test mode.
4. Implement Layer-4 app read tools.
5. Implement Layer-5 task packets.
6. Implement Layer-6 approval-gated queue execution.
7. Implement Layer-7 loop health tools.
8. Implement Layer-8 attribution and optimization.

## Safety Rule
Maximum autonomy means maximum governed capability, not uncontrolled mutation.
