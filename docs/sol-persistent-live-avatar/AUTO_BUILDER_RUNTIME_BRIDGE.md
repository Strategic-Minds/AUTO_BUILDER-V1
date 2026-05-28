# AUTO BUILDER Runtime Bridge

Project: SOL Persistent Live Avatar Assistant v1
Repo: Strategic-Minds/AUTO_BUILDER
Folder: docs/sol-persistent-live-avatar
Mode: governed bridge between ChatGPT governance sessions and AUTO BUILDER execution environments

## Purpose
Define the handoff protocol between ChatGPT governance sessions and AUTO BUILDER or AUTO BUILDER 2 runtime environments that have access to Vercel, Supabase, Shopify, OpenAI, HeyGen, Google Workspace, Xyla, Opus, social scheduling, cron, workflow, and sandbox execution surfaces.

## Bridge Principle
ChatGPT governance sessions may prepare, validate, document, and commit governance artifacts. Runtime execution environments must verify connectors, execute staged actions, preserve rollback paths, and write evidence back to the repo before claiming completion.

## State Transfer Protocol
Before runtime execution starts, the runner must read:
1. MASTER_INDEX.md
2. SYSTEM_SOURCE_OF_TRUTH.md
3. OPERATIONAL_PHASE_MAP.md
4. FINAL_OPERATOR_HANDOFF.md
5. EXECUTIVE_DEPLOYMENT_SUMMARY.md
6. BLOCKER_BRIDGE_PLAN.md
7. IMPLEMENTATION_BACKLOG.md
8. STAGING_EXECUTION_QUEUE.md
9. EXECUTION_LEDGER.md

The runner must then record:
- Current branch
- Current commit SHA
- Target phase and step
- Target environment
- Available connectors
- Missing connectors
- Rollback checkpoint
- Approval state

## Execution Claims Protocol
No runner may claim an action is complete unless it records evidence.

Required evidence for execution claims:
- Timestamp UTC
- Actor or runner name
- Connector used
- System touched
- Target environment
- Branch or deployment ID
- Commit SHA
- Result
- Error state if any
- Rollback path
- Evidence link or log reference

## Connector Verification Protocol
Before executing stack actions, verify connector access:

| Connector | Required Verification |
|---|---|
| GitHub | Repo access, branch access, commit ability |
| Vercel | Project access, preview deploy access, env var access, cron support |
| Supabase | Staging project access, migration ability, RLS inspection |
| OpenAI | API key present, model available, route test possible |
| HeyGen | API key present, avatar ready, voice valid, entitlement confirmed |
| Shopify | Store access, staging or draft mode available |
| Google Workspace | Drive, Sheets, Gmail, Calendar permissions verified |
| Xyla | Automation surface available |
| Opus | Media automation surface available |
| Social systems | Draft or staging scheduling access only until approved |

If a connector is missing, record it in EXECUTION_LEDGER.md and continue only with independent safe tasks.

## Deployment Ownership
- ChatGPT governance session owns planning, docs, prompts, review, and blocker bridge documentation.
- AUTO BUILDER owns repo intake, governance adherence, execution coordination, and ledger updates.
- AUTO BUILDER 2 owns sandbox, build, preview, cron, deployment, and runtime validation when connectors are available.
- Production promotion requires explicit approval evidence and rollback readiness.

## Rollback Synchronization
Before any staging or production mutation:
1. Record last known passing commit.
2. Record branch name.
3. Record database rollback point if applicable.
4. Record environment variable changes by name only.
5. Record workflow or cron pause method.
6. Confirm recovery owner.

After rollback:
1. Re-run smallest safe validation.
2. Record result.
3. Update incident or blocker notes.
4. Resume only after validation passes.

## Cron Continuity
Cron changes must record:
- Cron expression
- Target route
- Environment
- Start timestamp
- Last successful run
- Failure logging location
- Pause method
- Rollback method

For SOL staging, the intended cadence is:

```text
*/5 * * * *
```

Cron must remain staging-only until production approval is captured.

## Sandbox Checkpointing
Each sandbox run must record:
- Runtime identifier
- Branch
- Commit SHA
- Install result
- Type check result
- Build result
- Route test result
- Policy gate result
- Failure recovery steps
- Next action

Sandbox failures must not be promoted to staging without documented self-heal and validation.

## Rehydration Validation
On every new governance or runtime session:
1. Read MASTER_INDEX.md.
2. Confirm latest repo commit.
3. Confirm current phase and step.
4. Confirm last ledger entry.
5. Confirm blocker state.
6. Confirm approval state.
7. Confirm rollback state.
8. Continue only from documented next action.

## Runtime Stop Conditions
Stop execution when:
- Connector access cannot be verified.
- Target environment is ambiguous.
- Approval evidence is missing for gated action.
- Rollback path is missing.
- Secrets are exposed.
- RLS validation fails.
- Production is selected before preview passes.
- Execution evidence cannot be captured.

## Handoff Output Requirement
Every runtime handoff back to ChatGPT or another operator must include:
- HUMAN NEEDED or NO HUMAN NEEDED
- Executive summary
- Key points
- Blocks
- Workaround
- Self-heal result
- Next GPT instruction
