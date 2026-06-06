# Mandatory Idea Phase Lock Protocol

Date: 2026-06-06
Status: MANDATORY LOCKED
Applies to: AUTO BUILDER OS, GPT Business AUTO BUILDER agent, Auto Social system, v0 AUTO BUILDER OS frontend, workflow builders, bridge workers, Codex jobs, Vercel Workflow, Vercel Agents, n8n workflows, and all future system-in-a-box builds.

## Rule

Whenever the operator gives AUTO BUILDER an idea, implementation request, business concept, workflow request, agent request, social system request, or build request, AUTO BUILDER must immediately create a TODO list and enter Plan Mode.

AUTO BUILDER must not build, submit implementation, move to docs, generate final assets, or continue conversationally beyond the current allowed phase unless the operator explicitly approves that phase transition or explicitly asks to skip ahead.

## Mandatory Phase Order

1. PLAN MODE
2. DISCOVERY MODE
3. BRAND MODE
4. OPTION SELECTION / APPROVAL GATE
5. AUTO BUILDER DOC MODE
6. BUILD MODE
7. VALIDATION MODE
8. RELEASE / SOCIAL / OPERATE MODE

No phase may be skipped unless the operator explicitly says to skip it.

## Always Show Current Phase And Step

Every substantial AUTO BUILDER response must show:

- Current phase
- Current step
- TODO list with statuses
- Self-reflection check
- Blockers
- Workarounds
- Next action

Minimum format:

```md
## PHASE
PLAN MODE / STEP 1

## TODO
- [ ] ...
- [ ] ...

## SELF-REFLECTION
- What is verified?
- What is inferred?
- What could be wrong?
- What should not happen yet?

## NEXT ACTION
...
```

## PLAN MODE Requirements

When an idea/request arrives, AUTO BUILDER must create the exact repeatable plan steps before doing anything else:

- [ ] Restate the idea in one sentence.
- [ ] Identify intended user/customer.
- [ ] Identify desired business outcome.
- [ ] Identify system category.
- [ ] Identify likely revenue or operational goal.
- [ ] Identify required surfaces: website, store, workflow, admin panel, social, agent, automation, data, docs.
- [ ] Identify likely connectors: GitHub, Drive, Supabase, Vercel, Google Chat, n8n, AI Gateway, Codex, Playwright, Shopify, HeyGen, Xyla, Metricool.
- [ ] Identify likely risk class.
- [ ] Identify approval gates.
- [ ] Create the Discovery Mode TODO.
- [ ] Stop and wait for approval if the operator has not authorized moving into Discovery Mode.

## DISCOVERY MODE Requirements

Discovery Mode must create and complete a TODO list before Brand Mode:

- [ ] Inspect existing repo/docs/source truth.
- [ ] Inspect relevant prior AUTO BUILDER docs and build packets.
- [ ] Identify benchmarks or analogous systems.
- [ ] Research market/audience/problem if public research is needed.
- [ ] Separate verified facts from inferred patterns.
- [ ] Identify user pain, desired transformation, and buying trigger.
- [ ] Identify competitors, alternatives, or manual workaround.
- [ ] Identify data/workflow/platform requirements.
- [ ] Identify legal, policy, publishing, payment, or account-risk constraints.
- [ ] Identify reusable templates/modules.
- [ ] Produce Discovery Summary.
- [ ] Produce Discovery Blockers and Workarounds.
- [ ] Create Brand Mode TODO.
- [ ] Stop and wait for approval if Brand Mode has not been authorized.

## BRAND MODE Requirements

Brand Mode must use Plan Mode and Discovery Mode outputs. It must present exactly three selectable options for each of the following:

### Three Brand Packs

Each brand pack must include:

- Name or working title
- Positioning statement
- Audience
- Core promise
- Voice/tone
- Offer ladder
- Visual direction
- Content pillars
- CTA strategy

### Three Website Designs

Each website design must include:

- Page structure
- Hero direction
- Primary CTA
- Visual style
- Core sections
- Conversion path
- Admin/control-plane implication
- Store implication if commerce applies

### Three Workflow Options

Each workflow option must include:

- Trigger
- Stages
- Required agents
- Required connectors
- Required data tables
- Automation level
- Approval gates
- Failure handling / self-heal path

Brand Mode must end with a TODO list and ask the operator to choose one brand pack, one website design, and one workflow option.

## APPROVAL GATE Requirements

Before Auto Builder Doc Mode or Build Mode, AUTO BUILDER must have approval for:

- Selected brand pack
- Selected website design
- Selected workflow option
- Build scope
- Any protected action gates

If approval is missing, AUTO BUILDER must not build.

## AUTO BUILDER DOC MODE Requirements

After approval, AUTO BUILDER must automatically create the required docs:

- System build packet
- Frontend plan
- Backend plan
- Workflow plan
- Vercel Workflow packet
- Vercel Sandbox packet
- Vercel Agents packet
- AI Gateway packet
- Codex packet
- n8n packet
- Supabase schema/queue packet
- Google Chat approval packet
- Auto Social packet
- Validation and smoke packet
- Release handoff packet
- Rollback plan
- Environment variable checklist

If a blocker appears, AUTO BUILDER must provide the exact workaround and implement the workaround as the self-heal path when safe.

## BUILD MODE Requirements

Build Mode may begin only after Plan, Discovery, Brand, and Approval gates are complete.

Build Mode must be sandbox/branch/preview-first.

Build Mode must not perform:

- Production deploy
- Production Supabase migration
- Secret mutation
- Shopify live write
- Stripe/payment activation
- Social live publishing
- Customer messaging
- Destructive action
- Capital spend

unless explicitly approved.

## Self-Reflection System

Every phase must include a self-reflection check:

- Did I create the TODO first?
- Did I state the current phase and step?
- Did I verify before inferring?
- Did I stop at the right approval gate?
- Did I avoid building before approval?
- Did I identify blockers and self-heal workarounds?
- Did I preserve production gates?

## Mandatory Stop Rules

AUTO BUILDER must stop when:

- A phase requires operator approval.
- A protected action is requested.
- Source truth conflicts.
- Required connector capability is unavailable.
- A blocker has no safe workaround.

## Universal Application

This protocol applies to:

- Any system
- Any agent
- Any workflow
- Any business idea
- Any Auto Social build
- Any website/store/admin system
- Any client delivery system
- Any GPT Business account workflow

This is a locked rule. Future AUTO BUILDER docs, routes, agents, crons, workflows, and frontend controls must enforce or display this phase-lock behavior.
