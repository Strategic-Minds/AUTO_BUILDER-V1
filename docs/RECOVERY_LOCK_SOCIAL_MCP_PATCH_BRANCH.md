# RECOVERY LOCK: SOCIAL MCP PATCH BRANCH

## Status
Production is stable. The `patch/social-mcp-tools` preview branch is broken and must not be merged or deployed to production.

## Verified Stable Production State
1. Production `/api/health` returned 200.
2. Production `/api/mcp/tools` returned 200.
3. Original MCP tool set remained active.
4. Production `main` was not broken.

## Broken Surface
1. Branch: `patch/social-mcp-tools`.
2. Surface: Vercel Preview deployment.
3. Failure class: MCP route/social MCP wiring preview failure.
4. Do not merge this branch.
5. Do not redeploy production from this branch.

## Parked Work
The following work is parked until a clean branch with build validation exists:
1. MCP social route wiring.
2. `social_governance_preflight` MCP visibility.
3. `get_social_content_queue_status` MCP visibility.
4. Packet-generation MCP tools.
5. Social publishing connector execution.
6. Facebook/Xyla/Repurpose executor wiring.
7. Live social publishing loop.

## Staged But Not Active Files
The following files may remain staged only if they are not imported by the production MCP route:
1. `src/lib/autobuilder/social-mcp-tools.ts`
2. `src/lib/autobuilder/social-governance.ts`
3. `src/lib/autobuilder/social-status.ts`
4. `src/lib/autobuilder/social-receipts.ts`
5. `src/lib/autobuilder/social-packets.ts`

## Recovery Rules
1. Preserve production `main` as the stable source of truth.
2. Do not merge `patch/social-mcp-tools`.
3. Do not deploy production from `patch/social-mcp-tools`.
4. Do not continue MCP route wiring on the broken branch.
5. Do not add packet tools while recovery lock is active.
6. Do not enable live publishing.
7. Do not enable connector execution.
8. Do not enable auto-DM, mass engagement, or account mutation.

## Future Clean-Branch Strategy
When ready to resume:
1. Create a fresh branch from stable `main`.
2. Add only one small change at a time.
3. Run build validation before Vercel Preview.
4. Patch MCP route only after type validation.
5. Verify preview health before any merge.
6. Verify `/api/mcp/tools` before any production deployment.
7. Keep social tools status-only/governance-only before packet tools.

## Required Validation Before Resuming Social MCP Wiring
1. Build passes.
2. Preview deploy is green.
3. `/api/health` returns 200.
4. `/api/mcp/tools` returns 200.
5. Existing MCP tools remain visible.
6. New social status/governance tools appear only after route wiring is validated.

## Highest Priority
Production stability outranks all feature work.
