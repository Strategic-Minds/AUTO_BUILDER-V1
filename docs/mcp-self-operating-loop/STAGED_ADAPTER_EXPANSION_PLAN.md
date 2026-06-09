# MCP Staged Adapter Expansion Plan

## Purpose

Expand AUTO_BUILDER from registry/pulse/self-operating loop into staged connector readiness and adapter execution, one provider family at a time.

## Expansion Rule

Do not install or activate everything blindly. For each provider family:

1. classify operating layer,
2. identify official MCP/API/browser/n8n availability,
3. capture credential env names and scopes without secret values,
4. run read-only readiness smoke,
5. create receipt,
6. run harmless dry-run,
7. create receipt,
8. widen to sandbox/preview write only if validated,
9. keep live mutation gated,
10. feed results back into optimization queue.

## Provider Family Order

| Wave | Provider Family | Reason | First Safe Test |
| --- | --- | --- | --- |
| 0 | GitHub + Vercel | Source and runtime validation | PR status/readiness and preview route smoke |
| 1 | Supabase persistence | Receipts, queues, readiness, validation storage | Schema draft/advisor review, no production apply |
| 2 | Google Cloud + Workspace | Drive, Gmail drafts, Docs, Sheets, Tasks, Calendar, Cloud jobs | Read profile/metadata and draft-only artifact |
| 3 | Browser validation | Preview proof and route screenshots | Public/preview page visit, console/network capture |
| 4 | Social distribution | Metricool, Xyla, Meta, YouTube, TikTok, X, LinkedIn, all social | Draft calendar and analytics read, no publish |
| 5 | Creative/video | HeyGen, Opus, Canva, Figma, Runway, ElevenLabs | Draft/script/storyboard or metadata read |
| 6 | Commerce/payments | Shopify, Stripe, creator platforms, marketplaces | Read products/prices/orders only |
| 7 | CRM/support | HubSpot, Gmail, Salesforce, Zendesk, Intercom | Read/draft only |
| 8 | Finance/legal/HR/security | QuickBooks, Xero, Vanta, DocuSign, Gusto, vaults | Read/draft/compliance checklist only |
| 9 | Industry packs | Construction, local services, real estate, restaurants, legal, healthcare, education | Read-only capability inventory |

## Readiness States

- `candidate_unverified`
- `official_mcp_verified`
- `api_verified`
- `browser_possible`
- `workflow_bridge_possible`
- `ready_read_only`
- `ready_dry_run`
- `ready_sandbox_write`
- `ready_preview_write`
- `approval_gated_live_write`
- `blocked_missing_secret`
- `blocked_missing_runner`
- `blocked_policy_review`
- `blocked_compliance_review`

## Adapter Contract

Every adapter must expose:

- `id`
- `providerFamily`
- `operatingLayer`
- `readinessState`
- `requiredEnvNames`
- `allowedReadActions`
- `allowedDraftActions`
- `allowedDryRunActions`
- `approvalRequiredActions`
- `forbiddenActions`
- `validators`
- `receiptType`
- `rollbackStrategy`
- `costControls`
- `complianceNotes`

## Validation Requirements

Every adapter wave must pass:

- no-secret-output check
- readiness receipt check
- approval gate check
- rate-limit/cost note check
- rollback note check
- live mutation blocked check

## Continuous Optimization Loop

After each wave:

1. score adapter value,
2. score implementation cost,
3. score risk,
4. compare validation evidence,
5. update readiness state,
6. create next best connector task,
7. feed optimization queue.

## Next Workflow Action

After PR #25 validation and preview route evidence, start Wave 0 and Wave 1:

- GitHub/Vercel route evidence
- Supabase persistence schema review
- no-secret route smoke
- internal receipt dry-run
