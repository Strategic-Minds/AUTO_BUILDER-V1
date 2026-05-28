# SOL Cross Stack Dependency Map

Project: SOL Persistent Live Avatar Assistant v1
Mode: governed cross-stack orchestration

## Purpose
Document runtime dependencies, failure propagation risks, recovery sequencing, staging isolation, and ownership boundaries across the SOL ecosystem.

## Core Stack Dependency Flow
GitHub -> Vercel -> OpenAI -> Supabase -> HeyGen -> Shopify / Google Workspace / Social Systems

## Cross Stack Service Dependencies

| Service | Depends On | Primary Role | Failure Propagation Risk |
|---|---|---|---|
| GitHub | None | Source truth, docs, code | Blocks deployment and continuity |
| Vercel | GitHub, env variables | Runtime hosting and preview deploys | App unavailable or stale runtime |
| Supabase | Vercel server runtime | Auth, memory, approvals, audit logs | Auth failure, memory failure, data access issues |
| OpenAI | Vercel server runtime, secrets | SOL intelligence and policy routing | Chat route degradation |
| HeyGen | OpenAI output, API entitlement | Avatar rendering and video generation | Avatar unavailable or failed generation |
| Shopify | Auth and workflow logic | Commerce operations | Incorrect catalog or workflow behavior |
| Google Workspace | Auth and integration layer | Notifications, docs, sheets, coordination | Workflow interruption |
| Xyla | Content pipeline inputs | Automation planning | Content pipeline delays |
| Opus | Media pipeline inputs | Content clipping and media flows | Media automation delays |
| Social systems | Scheduling workflows | Distribution and publishing | Public posting failure or unintended publishing |

## Failure Propagation Risks

### GitHub Failure
Risk:
- No source truth access.
- No deployment updates.
- No continuity validation.

Recovery:
1. Preserve local evidence.
2. Pause deployment actions.
3. Restore repo access.
4. Revalidate latest commit.

### Vercel Failure
Risk:
- Runtime unavailable.
- Preview checks blocked.
- API routes inaccessible.

Recovery:
1. Pause promotions.
2. Validate environment variables.
3. Rebuild preview deployment.
4. Confirm health route.

### Supabase Failure
Risk:
- Auth instability.
- Missing memory.
- Approval logging interruption.
- RLS bypass risk.

Recovery:
1. Pause write actions.
2. Validate staging database state.
3. Restore snapshot if needed.
4. Revalidate RLS.

### OpenAI Failure
Risk:
- Chat route degradation.
- Policy gate interruption.
- Increased runtime failures.

Recovery:
1. Pause advanced chat actions.
2. Validate API key presence.
3. Validate route behavior.
4. Re-run safe prompts.

### HeyGen Failure
Risk:
- Avatar unavailable.
- Streaming or generation failure.
- Cost escalation risk.

Recovery:
1. Pause repeated generation.
2. Validate entitlement.
3. Validate avatar readiness.
4. Re-run one short staging test.

### Social or Shopify Failure
Risk:
- Incorrect public action.
- Workflow interruption.
- Unintended publishing.

Recovery:
1. Pause automation.
2. Disable scheduling.
3. Validate approval state.
4. Restore last safe workflow state.

## Recovery Sequencing
When multiple systems fail:
1. Restore GitHub source truth access.
2. Restore Vercel preview runtime.
3. Restore Supabase auth and logging.
4. Restore OpenAI routing.
5. Restore HeyGen validation.
6. Restore workflow automation.
7. Resume public or commerce actions last.

## Staging Isolation Rules
- Keep staging databases separate from production.
- Keep staging API keys separate from production.
- Never connect sandbox runs to production commerce or social systems.
- Keep preview deployments isolated.
- Use approval gates before promotion.

## Runtime Ownership Boundaries
| Layer | Primary Owner | Responsibility |
|---|---|---|
| GitHub | AUTO BUILDER | Source truth, docs, repo state |
| Vercel | AUTO BUILDER 2 | Runtime hosting, preview deploys |
| Supabase | Database operator | Auth, RLS, memory, audit logs |
| OpenAI | SOL runtime | Chat and policy routing |
| HeyGen | Avatar runtime | Avatar generation and streaming |
| Shopify | Commerce operator | Store operations |
| Google Workspace | Ops operator | Coordination and notifications |
| Xyla | Content automation | Automation planning |
| Opus | Media automation | Media workflows |
| Social systems | Distribution operator | Scheduling and publishing |

## Production Stop Conditions
Stop execution when:
- Cross-stack dependency state is unclear.
- Approval evidence is missing.
- Rollback path is missing.
- Secrets are exposed.
- RLS validation is incomplete.
- Production environment target is ambiguous.
