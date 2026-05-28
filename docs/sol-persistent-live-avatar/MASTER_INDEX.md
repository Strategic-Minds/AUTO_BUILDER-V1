# SOL Persistent Live Avatar Assistant v1 - Master Index

Repository: Strategic-Minds/AUTO_BUILDER
Folder: docs/sol-persistent-live-avatar
Operators: AUTO BUILDER and AUTO BUILDER 2
Mode: governed staging first

## Purpose
This master index inventories every SOL intake document, explains its purpose, phase and step relevance, approval level, execution dependency, rollback dependency, and recommended read order.

## Recommended Read Order
1. AUTO_BUILDER_FULL_STACK_BUILD_PACKET.md
2. MUTATION_MANIFEST.md
3. SOL_RUNTIME_GOVERNANCE.md
4. AUTO_BUILDER_OPERATOR_GUIDE.md
5. WORKFLOW_SPECS_SAFE.md
6. ENVIRONMENT_VARIABLE_MATRIX.md
7. SANDBOX_BUILD_RUNBOOK.md
8. STAGING_EXECUTION_CHECKLIST.md
9. PREVIEW_DEPLOY_VALIDATION.md
10. FINAL_DEPLOY_READINESS_GATE.md
11. STAGING_TO_PRODUCTION_PROMOTION.md
12. APPROVAL_GATES.md
13. ROLLBACK_PLAN.md
14. EXECUTION_LEDGER.md
15. HANDOFF_TO_AUTO_BUILDER_MCP.md

## Document Inventory

| Document | Purpose | Phase / Step Relevance | Approval Level | Execution Dependency | Rollback Dependency |
|---|---|---|---|---|---|
| AUTO_BUILDER_FULL_STACK_BUILD_PACKET.md | Defines project objective, stack scope, build tracks, safety rules, and immediate builder actions. | PHASE-2 / STEP-14 onward | Human approval before live mutation | Must be read before all execution | References rollback plan before production |
| MUTATION_MANIFEST.md | Defines authorized surfaces, restricted actions, and required mutation logging. | PHASE-2 / STEP-14 onward | Approval required for restricted actions | Required before any mutation | Required to identify rollback scope |
| SOL_RUNTIME_GOVERNANCE.md | Defines runtime modes, approval logic, policy gate rules, OpenAI controls, HeyGen controls, audit logging, and production stop conditions. | PHASE-2 / STEP-19 onward | Approval required for approved mutation mode | Required before runtime activation | Required before runtime rollback |
| AUTO_BUILDER_OPERATOR_GUIDE.md | Defines operator responsibilities, staging discipline, escalation logic, audit standards, and production stop conditions. | PHASE-2 / STEP-19 onward | Operator must follow before execution | Required before sandbox or staging work | Supports rollback authority decisions |
| WORKFLOW_SPECS_SAFE.md | Documents Vercel preview builds, sandbox validation, Supabase staging order, OpenAI routing, HeyGen validation, cron cadence, approvals, and rollback flow. | PHASE-2 / STEP-16 onward | Approval before production promotion | Required before workflow or cron configuration | References rollback sequencing |
| ENVIRONMENT_VARIABLE_MATRIX.md | Defines required keys, scope separation, staging versus production handling, secret storage, OpenAI, HeyGen, and Supabase key handling. | PHASE-2 / STEP-18 onward | Approval before production secrets | Required before preview or production deploy | Required for secret rollback or rotation |
| SANDBOX_BUILD_RUNBOOK.md | Defines sandbox build order, failure recovery, rollback checkpoints, evidence logging, and validation complete criteria. | PHASE-2 / STEP-18 onward | No approval for sandbox checks; approval before restricted actions | Required before build validation | Defines branch and database rollback checkpoints |
| STAGING_EXECUTION_CHECKLIST.md | Defines staging branch setup, package intake, env checks, route testing, Supabase checks, HeyGen checks, rollback checkpoints, and evidence logging. | PHASE-2 / STEP-17 onward | Approval before staging SQL or cost-bearing tests | Required before staging execution | Required for staging rollback evidence |
| PREVIEW_DEPLOY_VALIDATION.md | Defines preview deployment checks, health route, OpenAI route, Supabase, HeyGen, approval gates, rollback, and production stop gate. | PHASE-2 / STEP-17 onward | Approval before production promotion | Required after preview deploy | Required before production rollback readiness |
| FINAL_DEPLOY_READINESS_GATE.md | Defines final validation gates, production approval evidence, rollback readiness, OpenAI, HeyGen, Supabase safeguards, and stop conditions. | PHASE-2 / STEP-20 onward | Explicit human approval required | Required before production deploy | Required before production rollback plan approval |
| STAGING_TO_PRODUCTION_PROMOTION.md | Defines controlled promotion from sandbox to staging to preview to production. | PHASE-2 / STEP-20 onward | Explicit human approval required | Required before production environment promotion | Required for production rollback sequence |
| APPROVAL_GATES.md | Defines human approval checkpoints, automatically allowed actions, and approval workflow. | PHASE-2 / STEP-15 onward | Defines all approval classes | Required before any gated mutation | Required before destructive rollback |
| ROLLBACK_PLAN.md | Defines rollback principles, triggers, sequence, and evidence requirements. | PHASE-2 / STEP-15 onward | Approval required for destructive or production rollback | Required before deploy and SQL execution | Primary rollback reference |
| EXECUTION_LEDGER.md | Defines required evidence log format and dehydrate format. | PHASE-2 / STEP-15 onward | No approval required to log; approval required for gated action evidence | Required for all actions | Required to prove rollback state |
| HANDOFF_TO_AUTO_BUILDER_MCP.md | Defines intake target, required actions, governance constraints, and success criteria for external AUTO BUILDER execution. | PHASE-2 / STEP-15 onward | Approval required before external runner mutates restricted systems | Required for AUTO BUILDER / AUTO BUILDER 2 ingestion | References rollback and logging docs |

## Approval Levels

### Level 0 - Read Only
Allowed without extra approval:
- Reading docs
- Planning
- Drafting
- Static review
- Logging non-mutating findings

### Level 1 - Sandbox
Allowed within governed staging-first scope:
- Disposable install checks
- Type checks
- Build checks
- Policy gate tests
- Health route tests

### Level 2 - Staging Mutation
Requires logged authorization:
- Staging branch creation
- Staging preview deployment
- Staging Supabase SQL
- One short HeyGen staging validation test

### Level 3 - Production or Cost-Bearing Action
Requires explicit human approval:
- Production deploy
- Production SQL
- Billing or payment changes
- Shopify live changes
- Public social publishing
- Bulk outbound messaging
- Repeated avatar generation

### Level 4 - Irreversible or Destructive Action
Requires explicit approval and rollback evidence:
- Destructive SQL
- Production rollback
- Credential rotation impacting live services
- Workflow disabling affecting live operations

## Operator Dependency Map

### Before Any Execution
Read:
1. MASTER_INDEX.md
2. AUTO_BUILDER_FULL_STACK_BUILD_PACKET.md
3. MUTATION_MANIFEST.md
4. AUTO_BUILDER_OPERATOR_GUIDE.md
5. SOL_RUNTIME_GOVERNANCE.md

### Before Sandbox Build
Read:
1. ENVIRONMENT_VARIABLE_MATRIX.md
2. SANDBOX_BUILD_RUNBOOK.md
3. APPROVAL_GATES.md
4. EXECUTION_LEDGER.md

### Before Staging Execution
Read:
1. STAGING_EXECUTION_CHECKLIST.md
2. WORKFLOW_SPECS_SAFE.md
3. ROLLBACK_PLAN.md
4. EXECUTION_LEDGER.md

### Before Preview Deploy
Read:
1. PREVIEW_DEPLOY_VALIDATION.md
2. ENVIRONMENT_VARIABLE_MATRIX.md
3. SOL_RUNTIME_GOVERNANCE.md
4. ROLLBACK_PLAN.md

### Before Production Promotion
Read:
1. FINAL_DEPLOY_READINESS_GATE.md
2. STAGING_TO_PRODUCTION_PROMOTION.md
3. APPROVAL_GATES.md
4. ROLLBACK_PLAN.md
5. EXECUTION_LEDGER.md

### Before External AUTO BUILDER Runtime Handoff
Read:
1. HANDOFF_TO_AUTO_BUILDER_MCP.md
2. WORKFLOW_SPECS_SAFE.md
3. FINAL_DEPLOY_READINESS_GATE.md
4. EXECUTION_LEDGER.md

## Required Evidence Bundle
Every meaningful execution cycle must produce:
- Branch name
- Commit SHA
- Runtime environment
- Command or action summary
- Result
- Blocker if any
- Workaround if any
- Rollback path
- Approval evidence if required
- Next GPT instruction

## Production Stop Summary
Do not proceed to production if:
- Approval evidence is missing.
- Preview validation has not passed.
- RLS is incomplete.
- Secrets are missing or exposed.
- Rollback path is missing.
- OpenAI route is unstable.
- HeyGen entitlement is unverified.
- Audit logging is incomplete.
- Production target is ambiguous.
