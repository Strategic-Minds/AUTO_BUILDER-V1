# Vercel Workflow And Agent Blueprint

## Workflow

Name: `auto-builder-mcp-pulse`

Cron: every 5 minutes

Endpoint: `/api/cron/auto-builder-mcp-pulse`

Purpose: continuously inspect readiness, failures, opportunities, validation gaps, and auto-heal candidates without performing live external mutation by default.

## Allowed By Default

- Read MCP registry.
- Check provider readiness metadata.
- Check last receipts.
- Check stale failures.
- Check validation status.
- Check queue state.
- Check pending approvals.
- Check failed workflows.
- Check public uptime.
- Check build/deploy status.
- Check social draft queue.
- Check discovery queue.
- Check auto-heal candidates.
- Create internal receipt.
- Create internal task or recommendation.

## Not Allowed Without Approval

- Production deploy.
- Send message.
- Publish post.
- Charge/refund.
- Edit live store.
- Write production database.
- Change DNS.
- Rotate secrets.
- Delete/archive.

## Pulse Pipeline

1. `read_registry`: load current registry and readiness states.
2. `read_receipts`: fetch latest receipts and stale failure records.
3. `read_provider_status`: inspect GitHub, Vercel, Supabase, Drive, Shopify, Stripe, social, and browser-readiness metadata where available.
4. `run_discovery_checks`: queue public research and trend scans.
5. `run_validation_checks`: check build, preview, browser, uptime, schema, security, SEO, accessibility, and social draft validators.
6. `detect_auto_heal_candidates`: identify failures and map to repair playbooks.
7. `draft_auto_fix_tasks`: create internal issues, patch plans, PR plans, or inactive workflow duplicates.
8. `score_optimization_candidates`: rank website, social, email, CRM, commerce, ops, and finance improvements.
9. `write_receipt`: record pulse outcome.
10. `route_approval_needed`: surface guarded actions requiring operator approval.

## Vercel Sandbox Role

Vercel Sandbox is the execution lane for:

- Reversible build experiments.
- Connector dry-runs.
- Browser validation runners.
- Inactive workflow scaffolds.
- Mock payload replay.
- Agent prompt/eval tests.
- Schema and registry validation.

Sandbox must not be treated as production. All production-impacting actions require explicit approval.

## Vercel Agents

| Agent | Role | Default Autonomy |
| --- | --- | --- |
| Registry Agent | Maintains MCP catalog, scores, readiness, credentials metadata | Level 2 |
| Discovery Agent | Runs public market/tech/content/product/compliance discovery | Level 1-2 |
| Validation Agent | Runs validators and records evidence | Level 2-3 |
| Auto-Heal Agent | Detects failures and drafts recovery actions | Level 1-2 |
| Auto-Fix Agent | Drafts patches, issues, PR plans, dependency updates | Level 2-3 |
| Social Agent | Researches, drafts, schedules internal queues, analyzes signals | Level 1-2 |
| Optimization Agent | Scores improvements and proposes tests | Level 1-2 |
| Governance Agent | Applies approval gates, risk class, policy, cost controls | Level 2 |

## API Routes To Build

- `GET /api/mcp-universe/registry`
- `POST /api/mcp-universe/registry/score`
- `GET /api/mcp-universe/readiness`
- `POST /api/mcp-universe/receipts`
- `GET /api/mcp-universe/receipts`
- `POST /api/mcp-universe/approval-needed`
- `GET /api/cron/auto-builder-mcp-pulse`

## Data Tables Or Collections

- `mcp_registry`
- `mcp_readiness`
- `mcp_credentials_metadata`
- `mcp_receipts`
- `mcp_validation_results`
- `mcp_auto_heal_candidates`
- `mcp_auto_fix_tasks`
- `mcp_approval_queue`
- `mcp_optimization_queue`

## Validation

Required before release:

- Registry JSON schema validation.
- Cron dry-run test.
- No-secret-output test.
- Read-only provider status test.
- Approval-gate test for Level 4 and Level 5 actions.
- Receipt creation test.
- Rollback-reference presence test for reversible writes.
