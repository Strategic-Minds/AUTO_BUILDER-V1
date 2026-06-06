# Mandatory New Idea Sandbox Folder System

Date: 2026-06-06
Status: MANDATORY LOCKED
Applies to: GPT Business AUTO BUILDER agent, AUTO BUILDER OS, Vercel Workflow/Sandbox/Agents, Codex, n8n, Google Drive, GitHub, and every new idea not directly related to the AUTO BUILDER repo/OS/Drive/Supabase/related systems.

## Rule

When the operator gives a new idea, concept, business, workflow, website, store, agent, content system, or app request that is not directly related to the AUTO BUILDER repo, AUTO BUILDER OS, Drive source system, Supabase backend, Vercel build system, or existing related infrastructure, the agent must immediately create or request creation of a dedicated sandbox idea folder system before continuing.

No unrelated idea may be mixed into AUTO BUILDER core folders, repo docs, scratch notes, or existing system folders.

## Recognition Triggers

Trigger this rule when the user says or implies:

- idea
- new idea
- business idea
- build a new system
- new app
- new workflow
- new agent
- new website/store
- new content/social system
- anything unrelated to AUTO BUILDER OS infrastructure

## Required Sandbox Folder Structure

Use this canonical structure:

- `00_START_HERE.md`
- `01_PLAN/`
- `02_DISCOVERY/`
- `03_BRAND_OPTIONS/`
- `04_APPROVALS/`
- `05_BUILDER_DOCS/`
- `06_VERCEL_BUILD_PACKET/`
- `07_ASSETS/`
- `08_WORKFLOW_AND_AGENTS/`
- `09_SOCIAL_AND_CONTENT/`
- `10_VALIDATION_AND_SMOKE/`
- `11_RELEASE_HANDOFF/`
- `12_OPERATE_OPTIMIZE/`
- `99_ARCHIVE/`

## Required Start File

The sandbox folder must include `00_START_HERE.md` with:

- idea name
- created date
- owner/operator
- phase/status
- source classification
- GitHub search status
- Drive search status
- autonomous GPT bridge status
- Vercel build target
- protected gates
- TODO audit table
- current blockers
- next action

## Mandatory TODO Audit

Before moving from one phase to another, every TODO must be marked:

- Complete
- Blocked
- Not Applicable

No TODO may be silently skipped. If Not Applicable, the reason must be written.

## Workflow

1. Create sandbox idea folder.
2. Write `00_START_HERE.md`.
3. Enter PLAN MODE / STEP 1.
4. Search GitHub and Google Drive.
5. Use autonomous GPT bridge or record blocker.
6. Complete Discovery TODO.
7. Produce exactly 3 brand packs, 3 website/content designs, 3 workflow options.
8. Stop for approval.
9. After approval, create builder docs and Vercel build packet.
10. Submit to Vercel Workflow/Sandbox/Agents.
11. Validate and collect smoke evidence.
12. Stop before protected gates.

## Vercel Handoff

The new sandbox system must produce `06_VERCEL_BUILD_PACKET/vercel-build-packet.json` and a human-readable `06_VERCEL_BUILD_PACKET/VERCEL_WORKFLOW_HANDOFF.md`.

GPT/AUTO BUILDER does not build the system. Vercel builds/executes the system from the packet.

## Drive/GitHub Behavior

If Drive folder creation tools are unavailable, create the folder manifest and queue a Drive folder creation request. If GitHub repo/branch creation is needed, create the packet and stop before external mutation unless approved.

## Acceptance Criteria

- New idea recognized.
- Separate sandbox folder/manifest exists or creation blocker is logged.
- TODO audit exists.
- GitHub and Drive search status recorded.
- Bridge status recorded.
- Vercel build packet exists.
- Protected gates preserved.
