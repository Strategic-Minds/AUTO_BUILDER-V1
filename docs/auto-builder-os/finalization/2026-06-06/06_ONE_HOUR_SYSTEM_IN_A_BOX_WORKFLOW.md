# One-Hour System-In-A-Box Workflow

## Objective

AUTO BUILDER OS should repeatedly turn an idea into a complete, governed, preview-ready business system in roughly one hour when the request fits reusable templates and connected accounts/env values are ready.

This is an operating target, not a guaranteed outcome. Complex systems, missing env, compliance gates, or live connector limitations can extend the timeline.

## Input

The user gives GPT one idea, for example:

- Build me an AI receptionist system for dentists.
- Build me a Shopify upsell system.
- Build me a social media agent for local restaurants.
- Build me an internal dashboard for sales attribution.
- Build me a workflow automation for lead follow-up.

## Output

AUTO BUILDER returns a system-in-a-box:

- Discovery summary.
- Benchmark summary.
- Brand and offer system.
- Build packet.
- Website or app preview.
- Store setup if commerce is needed.
- Admin control plane.
- Supabase schema and queue plan.
- Vercel workflow and cron plan.
- n8n workflow plan.
- Auto social system.
- Setup/env checklist.
- Screenshots and smoke receipts.
- Approval gates.
- Rollback plan.
- Next optimization loop.

## Repeatable Workflow

### Minute 0-5: Intake And Classification

- Capture idea.
- Identify business type.
- Identify target user and outcome.
- Select template route.
- Assign risk class.
- Create initial run id.

### Minute 5-15: Discovery And Benchmark

- Inspect source truth.
- Benchmark 3 similar systems/offers.
- Extract hooks, offer structure, funnel, tech pattern, social pattern.
- Separate verified facts from inferred patterns.
- Score opportunity.

### Minute 15-25: Brand And Offer

- Generate name/positioning.
- Define audience.
- Create offer ladder.
- Draft landing copy.
- Create content pillars.
- Define CTA and conversion path.

### Minute 25-35: Build Docs

- Generate build packet.
- Generate frontend/backend/workflow spec.
- Generate data model.
- Generate connector/env checklist.
- Generate validation plan.
- Generate release handoff.

### Minute 35-50: Sandbox Build

- Create branch/sandbox job.
- Apply reusable templates.
- Build website/app/admin panel.
- Add API routes and queue stubs.
- Add Supabase migration draft.
- Add workflow/n8n draft.
- Add social system draft.

### Minute 50-60: Harden And Handoff

- Run route smoke.
- Run browser screenshot.
- Run secret-name-only check.
- Run policy gate check.
- Generate final proof pack.
- Stop before protected production actions.

## Template Routes

1. Lead Magnet Funnel
   - Website, form, lead table, thank-you page, social launch pack.

2. SaaS MVP
   - Auth, dashboard, CRUD, billing-ready but payment-gated, docs, social pack.

3. Shopify Growth System
   - Store/admin plan, product/draft flows, upsell/cross-sell, social pack, live store gated.

4. AI Agent Workflow
   - Agent manifest, prompt pack, queue, tool receipts, frontend console, approval gates.

5. Content Engine
   - Brand, calendar, Xyla/HeyGen/Metricool draft pipeline, approval queue, analytics loop.

6. Client Dashboard
   - Supabase views, KPI cards, exports, admin panel, screenshot receipts.

7. Automation Bridge
   - Webhooks, queue, retries, receipts, n8n workflow, monitoring.

8. Research Intelligence System
   - Search/crawler, scoring, citations, dashboard, content/report output.

## Required Reusable Assets

- Frontend component packs.
- Supabase schema modules.
- Vercel Workflow templates.
- n8n workflow templates.
- Social content templates.
- Shopify store templates.
- Agent manifest templates.
- Prompt packs.
- Validation scripts.
- Release handoff templates.

## Acceptance Criteria

A one-hour build is acceptable when:

- It uses a known template route.
- It has a preview or runnable sandbox.
- It has docs and setup checklist.
- It has smoke evidence.
- It has no exposed secrets.
- It has clear approval gates.
- It has a social launch pack.
- It can be handed to a client or operator to connect accounts/env.

## Human Needed

Human approval is needed for:

- Production deploy.
- Domain connection.
- Production database migration.
- Secret creation/rotation.
- Shopify live writes.
- Stripe/payment activation.
- Social live publishing.
- Customer messages.
- Paid generation/spend.

## No Human Needed By Default

- Discovery.
- Benchmarking public sources.
- Builder docs.
- Branch docs/code.
- Sandbox build.
- Preview deploy if env exists and policy allows.
- Browser screenshots.
- Draft social assets.
- Draft n8n workflow.
- Draft Shopify plan.
- Validation report.
- Release handoff draft.
