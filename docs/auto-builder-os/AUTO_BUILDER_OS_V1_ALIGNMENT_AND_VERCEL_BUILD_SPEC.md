# AUTO BUILDER OS v1.0 - Alignment and Vercel Build Spec

## Status

This document is the consolidated AUTO BUILDER OS v1.0 source-of-truth build specification for Auto Builder to execute. GPT is not the builder. Auto Builder is the builder. Codex, Vercel Workflow, Vercel Sandbox, Vercel Cron, Vercel Agents, n8n, Supabase, OpenAI Platform, and AI Gateway are execution/control systems.

## Verified Repo Context

- Repository: Strategic-Minds/AUTO_BUILDER
- Default branch: main
- Existing root package: auto-builder-bridge
- Existing root scripts: dev, build, start, validate:factory
- Existing control-plane package: @xps-ai-factory/control-plane
- Existing repos declared by Auto Builder summary:
  - Strategic-Minds/AUTO_BUILDER
  - Strategic-Minds/SANDBOX
  - Strategic-Minds/FRONTEND
- Existing providers declared by Auto Builder summary:
  - github
  - vercel
  - supabase
  - shopify
  - openai
  - groq
  - codex
  - google_workspace
  - xyla
  - opus
- Existing workflow declared by Auto Builder summary:
  - executive-intake
  - self-reflection
  - discovery
  - branding
  - build-in-sandbox
  - promote-source
  - promote-frontend
  - validate
  - audit
  - improve
- Existing factory surfaces declared by Auto Builder summary:
  - /api/factory/readiness
  - /api/factory/router
  - /api/factory/build-packet
  - /api/factory/capability-test
  - /api/factory/reverse-engineering
  - /api/cron/factory-readiness
  - /api/cron/reverse-engineering-passive

## Could Not Verify

- Full code tree beyond exposed repo summary.
- Recent pushes beyond the new AUTO BUILDER OS documentation writes.
- Existing v0-style frontend code path.
- Existing Vercel Workflow implementation.
- Existing Vercel Agents implementation.
- Existing AI Gateway configuration.
- Existing n8n workflows.
- Existing Supabase tables and policies.

Auto Builder must inspect these before mutation.

## Alignment Rule

Do not replace the existing Auto Builder pipeline. Align AUTO BUILDER OS v1.0 to the current pipeline:

existing executive-intake -> maps to AUTO BUILDER OS intake
existing self-reflection -> maps to proof loop and improvement loop
existing discovery -> maps to source truth audit and benchmark discovery
existing branding -> maps to brand validation and v0-style frontend requirements
existing build-in-sandbox -> maps to Vercel Sandbox and Codex branch build
existing promote-source -> maps to GitHub PR and source promotion gate
existing promote-frontend -> maps to Vercel preview and frontend promotion gate
existing validate -> maps to test gate and proof loop
existing audit -> maps to Supabase audit logs and proof artifacts
existing improve -> maps to improvement loop

## System Name

AUTO BUILDER OS

## System Positioning

A Google-first, n8n-controlled, GPT-powered, Codex-enabled, Vercel/Supabase-backed AI business factory that converts an idea into a profitable, benchmarked, automated business system.

## Non-Negotiable Rule

GPT is not the builder. GPT creates plans, structured outputs, reasoning, and instructions. Auto Builder is the builder. Codex implements approved repo work. Vercel executes app/runtime/workflow/sandbox/cron behavior. Supabase records state. n8n controls external workflow routing. Google Workspace is the client-friendly control layer.

## Required Universal Stack

1. ChatGPT Business - command and planning interface
2. AUTO BUILDER OS - governed builder system
3. GitHub - source authority and PR record
4. Codex - controlled engineering executor
5. Vercel - frontend, backend routes, sandbox, preview, workflow, cron, agents
6. Supabase - database, audit logs, run state, proof artifacts
7. n8n - workflow orchestration and app-to-app control
8. Google Workspace - Drive, Docs, Sheets, Chat, Gmail, Calendar, Forms
9. OpenAI Platform - programmatic AI execution
10. AI Gateway - model routing, cost control, observability
11. Shopify - commerce when needed
12. Stripe - billing when needed
13. Klaviyo - email/SMS revenue automation when needed
14. Metricool - social scheduling and analytics when needed
15. Canva, Runway, HeyGen - creative production when needed

## Client-Friendly Stack Tiers

### Tier 1: Free/Starter Blueprint
- Google Form
- Google Sheet
- Google Doc
- Gmail
- ChatGPT

### Tier 2: Automation Starter
- Tier 1 plus n8n
- Google Chat approvals
- Supabase logging

### Tier 3: Business System
- Tier 2 plus Vercel
- OpenAI Platform
- AI Gateway
- Codex

### Tier 4: Commerce/Content System
- Tier 3 plus Shopify
- Stripe
- Klaviyo
- Metricool
- Canva/Runway/HeyGen

## v0-Style Frontend Requirement

The new frontend must be aligned as an Auto Builder admin control plane with the following visual design:

- Looks and feels like v0.app
- Black background
- White font
- Chat panel on the left
- Editor/preview panel on the right
- Toolbar on the far right as a collapsible pop-out
- Deep electric blue hover effects
- Animated blue glow states for active controls
- Admin-first, clean, fast, modern
- Must support build packets, approval gates, logs, run status, agent status, and Vercel/Supabase/n8n status

## Frontend Functional Zones

1. Left Chat Panel
   - User idea intake
   - Auto Builder system dialogue
   - Build packet summary
   - Approval prompts
   - Next action prompts

2. Right Editor/Preview Panel
   - Build packet editor
   - Markdown/spec viewer
   - Code/spec preview
   - Vercel preview embed or link
   - Test result view

3. Right Pop-Out Toolbar
   - Runs
   - Agents
   - Gates
   - Logs
   - Vercel
   - Supabase
   - n8n
   - Codex
   - AI Gateway
   - Settings

4. Status Bar
   - Current run ID
   - Environment: read-only, sandbox, preview, production
   - Gate state
   - Approval state
   - Cost state
   - Last run status

## Universal Workflow

1. Idea Intake
2. Source Truth Audit
3. Business Plan
4. Strategy Plan
5. Financial/Profit Plan
6. End Goal
7. Top 3 Benchmark Discovery
8. Strength/Weakness Analysis
9. Weakness Repair
10. 20 Percent Better Plan
11. Plan Mode
12. Approval Gate
13. Build Packet
14. Codex Branch/PR Packet
15. Vercel Sandbox Build
16. Vercel Preview
17. n8n Workflow Packet
18. Supabase Audit Packet
19. Test Gate
20. Proof Loop
21. Final Strategic Approval
22. Production Promotion, only if approved
23. Audit
24. Improvement Loop

## Required Builder Documents

Auto Builder must create or maintain these docs under docs/auto-builder-os:

- AUTO_BUILDER_OS_MASTER_SYSTEM.md
- AUTO_BUILDER_OS_V1_ALIGNMENT_AND_VERCEL_BUILD_SPEC.md
- AUTO_BUILDER_OS_STACK.md
- AUTO_BUILDER_OS_WORKFLOW.md
- AUTO_BUILDER_OS_AGENT_ROSTER.md
- AUTO_BUILDER_OS_N8N_CONTROL_SPINE.md
- AUTO_BUILDER_OS_GOOGLE_WORKSPACE_LAYER.md
- AUTO_BUILDER_OS_CODEX_BRIDGE.md
- AUTO_BUILDER_OS_VERCEL_PIPELINE.md
- AUTO_BUILDER_OS_SUPABASE_AUDIT.md
- AUTO_BUILDER_OS_CLIENT_OFFER.md
- AUTO_BUILDER_OS_BLUEPRINT_TEMPLATE.md
- AUTO_BUILDER_OS_PRICING.md
- AUTO_BUILDER_OS_APPROVAL_GATES.md
- AUTO_BUILDER_OS_KILL_SWITCHES.md
- AUTO_BUILDER_OS_PROOF_LOOP.md
- AUTO_BUILDER_OS_SOURCE_TRUTH.md
- AUTO_BUILDER_OS_BUILD_PACKET_TEMPLATE.md
- AUTO_BUILDER_OS_IMPLEMENTATION_STANDARD.md

## Required Vercel Workflow Submission Packet

Auto Builder must generate a Vercel Workflow packet with:

- run_id
- source truth references
- build packet path
- target repo
- target branch
- target app
- sandbox environment
- preview environment
- required tests
- required proof artifacts
- required approval gates
- rollback plan
- AI Gateway routing plan
- Vercel Agents task plan
- 5-minute cron policy

## Vercel Workflow Stages

1. validate-source-truth
2. generate-build-packet
3. route-to-codex
4. build-in-sandbox
5. run-tests
6. create-preview
7. collect-proof
8. request-final-approval
9. promote-if-approved
10. audit-and-improve

## Vercel Sandbox Rules

Sandbox is mandatory before preview or production.

Sandbox may:
- run builds
- run tests
- render frontend
- call non-production endpoints
- write proof artifacts

Sandbox may not:
- mutate production data
- publish social content
- change billing
- send customer messages
- change credentials

## Vercel Cron 5-Minute Trigger

Schedule:
*/5 * * * *

Allowed:
- readiness checks
- queue checks
- failed workflow detection
- approval expiration checks
- sandbox status checks
- preview status checks
- cost/error monitoring
- stuck run detection

Blocked:
- production deploy
- repo mutation
- database mutation
- billing action
- social publishing
- customer messaging
- credential changes
- Shopify live mutation

## Vercel Agents

Required agents:

1. Auto Builder Director Agent
2. Source Truth Auditor Agent
3. Business Strategy Agent
4. Benchmark Agent
5. 20 Percent Better Agent
6. Codex Bridge Agent
7. Vercel Runtime Agent
8. Supabase Audit Agent
9. n8n Control Agent
10. AI Gateway Cost Agent
11. Frontend v0 UI Agent
12. Proof Loop Agent
13. Client Blueprint Agent

Each agent must have:
- name
- purpose
- inputs
- outputs
- allowed actions
- blocked actions
- approval requirement
- logging target
- rollback requirement

## AI Gateway Plan

AI Gateway must route:

- low-cost model for classification, routing, summarization
- higher-quality model for business strategy and final client-facing docs
- Codex for code changes
- batch or cached workflows where possible
- cost logging to Supabase

AI Gateway must block:
- uncontrolled high-volume runs
- production-affecting model calls without run_id
- workflows without cost policy

## Strategic Gates

Every action must pass through one of these gates:

- Source Truth Gate
- Plan Mode Gate
- Approval Gate
- Codex Gate
- n8n Gate
- Vercel Sandbox Gate
- Vercel Preview Gate
- Test Gate
- Supabase Audit Gate
- Proof Loop Gate
- Final Strategic Approval Gate
- Production Gate
- Rollback Gate

## Kill Switches

Default false:

- GLOBAL_AUTONOMY_ENABLED
- AUTO_BUILDER_BUILD_MODE_ENABLED
- CODEX_MUTATION_ENABLED
- N8N_EXECUTION_ENABLED
- PRODUCTION_DEPLOY_ENABLED
- VERCEL_PROMOTION_ENABLED
- SUPABASE_MUTATION_ENABLED
- SHOPIFY_MUTATION_ENABLED
- STRIPE_ACTIONS_ENABLED
- SOCIAL_PUBLISHING_ENABLED
- CUSTOMER_MESSAGING_ENABLED
- WORKBOOK_WRITE_ENABLED

## Supabase Audit Tables

Required draft tables:

- auto_builder_runs
- auto_builder_gate_events
- auto_builder_approvals
- auto_builder_codex_runs
- auto_builder_n8n_runs
- auto_builder_test_results
- auto_builder_proof_artifacts
- auto_builder_rollback_events
- auto_builder_cost_events
- auto_builder_agent_runs

## Source Truth Hierarchy

1. Jeremy current-session explicit command
2. Approved repo files
3. Approved Drive canon
4. Approved GPT Workbook Master Index
5. Supabase audit records
6. Connected app live state
7. Prior ChatGPT outputs
8. Inference

## Client Offer Architecture

AUTO BUILDER OS must support the AI consulting business with:

1. Free AI Automation Blueprint
2. Paid AI Workflow Audit
3. Google + n8n Automation Starter
4. Auto Builder OS Setup
5. Full AI Business System
6. Monthly AI Ops Retainer
7. Template Library / Licensing later

## Free AI Automation Blueprint Deliverable

The free blueprint must include:

- client business summary
- top 3 automation opportunities
- recommended Google-first stack
- recommended n8n workflow
- estimated time saved
- estimated revenue opportunity
- next 3 actions
- recommended paid offer

## Build Packet Template

Every build packet must include:

- run_id
- request summary
- verified source truth
- inferred assumptions
- could not verify
- business plan
- strategy plan
- financial/profit plan
- end goal
- top 3 benchmark analysis
- 20 percent better plan
- architecture
- required agents
- required workflows
- Vercel sandbox plan
- n8n plan
- Supabase audit plan
- Codex implementation plan
- tests
- proof artifacts
- approval gates
- rollback plan
- success metrics

## Required Tests

- test:factory
- test:router
- test:build-packet
- test:approval-gates
- test:kill-switches
- test:codex-contract
- test:n8n-contract
- test:supabase-logging
- test:vercel-preview
- test:workbook-index
- test:source-truth
- test:proof-loop
- test:v0-frontend
- test:ai-gateway-routing
- test:vercel-agents

## Acceptance Criteria

AUTO BUILDER OS v1.0 is aligned and ready for Auto Builder execution when:

1. Docs are installed under docs/auto-builder-os.
2. Existing workflow is preserved and mapped.
3. No existing Auto Builder pipeline is overwritten without approval.
4. v0-style frontend requirement is included.
5. Vercel Workflow packet exists.
6. Sandbox rules exist.
7. 5-minute cron rules exist.
8. AI Gateway rules exist.
9. Vercel Agents plan exists.
10. Strategic gates exist.
11. Kill switches exist.
12. Supabase audit plan exists.
13. n8n control spine exists.
14. Codex bridge exists.
15. Proof loop exists.
16. Client offer system exists.
17. Auto Builder is instructed to build, not GPT.

## Auto Builder Execution Instruction

Auto Builder must now:

1. Inspect the entire repo.
2. Compare this spec to current code and docs.
3. Detect conflicts.
4. Preserve existing working pipeline.
5. Create missing docs/code in a branch.
6. Submit to Vercel Workflow system.
7. Run sandbox build.
8. Apply 5-minute readiness cron only for allowed checks.
9. Route model work through AI Gateway.
10. Assign Vercel Agents.
11. Return proof artifacts and PR.
12. Stop before production unless Jeremy approves.

## Final Required Output From Auto Builder

- HUMAN NEEDED / NO HUMAN NEEDED
- EXECUTIVE SUMMARY
- VERIFIED
- INFERRED
- COULD NOT VERIFY
- TO-DO LIST STATUS
- CONFLICT REPORT
- FILES CREATED
- FILES UPDATED
- VERCEL WORKFLOW PACKET
- SANDBOX STATUS
- 5-MINUTE CRON STATUS
- AI GATEWAY STATUS
- VERCEL AGENTS STATUS
- TEST RESULTS
- PROOF ARTIFACTS
- PR LINK
- RISKS / BLOCKS
- WORKAROUND
- NEXT ACTION
- NEXT GPT INSTRUCTION
