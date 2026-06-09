# AUTO_BUILDER Universal MCP Registry Implementation Packet

## 1. Current Status

DOCS-phase branch promotion has added the AUTO_BUILDER MCP universe registry pack under `docs/mcp/**`. Vercel workflow installation, Vercel Sandbox/Agent provisioning, Supabase schema writes, Drive folder creation, connector activation, and production changes remain excluded until separately approved.

## 2. Source Truth

- User handoff for universal MCP categories, schema, autonomy levels, auto-heal, validation, discovery, social, optimization, 5-minute Vercel pulse, and top-50 MCP priority.
- `Strategic-Minds/AUTO_BUILDER` README.
- `SYSTEM_SOURCE_OF_TRUTH.md`.
- `AUTONOMY_AND_APPROVAL_MATRIX.md`.
- `src/app/api/mcp/route.ts`.
- `src/lib/factory.ts`.
- AUTO BUILDER 2 MCP app summary.
- Existing AWOS bridge registry and governance memory.

## 3. System Boundary

Included:

- Universal registry and 20-layer MCP architecture.
- Top-50 MCP priority ranking.
- Autonomy, approval, risk, receipt, validation, auto-heal, auto-fix, optimization, social, discovery, and industry expansion model.
- Vercel 5-minute pulse blueprint.
- Sandbox and Vercel Agent blueprint.

Excluded until approval:

- Vercel Workflow installation.
- Vercel Sandbox/Agent provisioning.
- Drive folder creation.
- Supabase schema/table writes.
- External connector activation.
- Social, commerce, payment, customer, DNS, secrets, or production actions.

## 4. Frontend Plan

Add an MCP Universe Command Center:

- Registry table by 20 operating layers.
- Top-50 install priority board.
- Readiness state cards.
- Credential metadata checklist without secret exposure.
- Validation queue.
- Auto-heal candidates.
- Auto-fix tasks.
- Approval queue.
- Receipt viewer.

Candidate paths:

- `src/app/mcp-universe/page.tsx`
- `src/components/mcp-universe/registry-table.tsx`
- `src/components/mcp-universe/readiness-board.tsx`
- `src/components/mcp-universe/approval-queue.tsx`
- `src/components/mcp-universe/receipt-viewer.tsx`

## 5. Backend Plan

Add registry modules:

- `src/lib/autobuilder-v2/mcp-universe/types.ts`
- `src/lib/autobuilder-v2/mcp-universe/registry.ts`
- `src/lib/autobuilder-v2/mcp-universe/scoring.ts`
- `src/lib/autobuilder-v2/mcp-universe/governance.ts`
- `src/lib/autobuilder-v2/mcp-universe/receipts.ts`
- `src/lib/autobuilder-v2/mcp-universe/validators.ts`
- `src/lib/autobuilder-v2/mcp-universe/pulse.ts`

Add routes:

- `src/app/api/mcp-universe/registry/route.ts`
- `src/app/api/mcp-universe/readiness/route.ts`
- `src/app/api/mcp-universe/receipts/route.ts`
- `src/app/api/mcp-universe/approval-needed/route.ts`
- `src/app/api/cron/auto-builder-mcp-pulse/route.ts`

## 6. Repo And File Map

Docs promoted in this DOCS phase:

- `docs/mcp/README.md`
- `docs/mcp/AUTO_BUILDER_MASTER_MCP_UNIVERSE_REGISTRY.md`
- `docs/mcp/mcp-universe-registry.seed.json`
- `docs/mcp/VERCEL_WORKFLOW_AND_AGENT_BLUEPRINT.md`
- `docs/mcp/AUTO_HEAL_AUTO_FIX_VALIDATION_MODEL.md`
- `docs/mcp/IMPLEMENTATION_PACKET.md`

Implementation files pending BUILD:

- TypeScript registry modules.
- API routes.
- Cron route.
- Optional dashboard components.
- Tests.

## 7. Tool And Integration Plan

Phase DOCS:

- Promote docs to repo branch.
- Validate diff is limited to `docs/mcp/**`.
- Open PR only if requested or already approved.

Phase BUILD:

- Implement registry schema and seed loader.
- Implement read-only registry API.
- Implement receipt writer.
- Implement pulse in read-only/internal-write mode.
- Add tests.

Phase VALIDATE:

- `npm run build`
- `npm run validate:factory`
- registry schema validation
- pulse dry run
- approval gate tests
- no-secret-output test
- receipt creation test

Phase RELEASE:

- Preview deploy.
- Browser smoke.
- Operator approval for production deploy only after receipts pass.

## 8. Validation Plan

Minimum validators:

- JSON schema validation for registry.
- Unit tests for autonomy classification.
- Unit tests for risk/approval gating.
- Cron route dry-run.
- API smoke for registry/readiness/receipts.
- Secret leakage scan.
- Build test.
- Factory validation script.
- Browser preview smoke.

## 9. Required Docs And Playbooks

- This registry pack.
- Existing repo governance docs.
- Existing AWOS operating library.
- Connector readiness priority lane.
- Autonomous bridge registry.

## 10. Blockers Or Missing Pieces

- No current approval for BUILD-phase code changes.
- No confirmed credential inventory.
- No complete official-MCP availability audit.
- No Vercel Workflow/Sandbox/Agent provisioning approval.
- No Drive folder creation approval.
- No Supabase table/migration approval.

## 11. Next Best Prompt

Approve BUILD-phase implementation of the read-only/internal-write MCP universe registry and 5-minute pulse under `src/lib/autobuilder-v2/mcp-universe/**`, `src/app/api/mcp-universe/**`, and `src/app/api/cron/auto-builder-mcp-pulse/route.ts`, with no production deploy, no connector activation, no secrets changes, and no live external writes.
