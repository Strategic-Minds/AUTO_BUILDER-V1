---
name: business-build-workflow
description: Use when an agent must bootstrap, scaffold, and execute the same governed business build workflow every time: ask discovery questions, research competitors, plan, create a brand pack, create website options, wait for the user's website-pack selection, build exactly the selected website, test, review, harden, and prepare deployment with approval gates.
---

# Business Build Workflow

Use this skill for every new business, website, funnel, app, brand, or launch build.

## Non-Negotiable Order

1. Intake Questions
2. Discovery
3. Plan
4. Brand Pack
5. Website Pack
6. User Selection Gate
7. Build Exactly Selected Option
8. Test
9. Review
10. Harden
11. Deploy Gate
12. Release Handoff

Do not build before the user chooses the website pack option unless the user explicitly says to skip selection.

## Start Every Run

Ask only the missing questions that block the next phase. Minimum intake:

- Business name
- Offer or product
- Target customer
- Geography
- Desired style
- Must-have pages
- Must-have integrations
- Existing assets
- Deployment target
- Approval owner

If enough context already exists, state assumptions and move forward.

## Required Outputs

Use `scripts/bootstrap_business_build.py` to create the folder system and starter templates:

```bash
python3 scripts/bootstrap_business_build.py --name "Business Name" --slug business-slug --root ./builds
```

Each run must produce:

- Discovery notes
- Benchmark comparison
- Build plan
- Brand pack
- Website pack with options
- User approval record
- Built website/app
- Test report
- Review findings
- Hardening log
- Deployment handoff

## Approval Gates

Pause for approval before:

- Choosing the final website direction
- Publishing or deploying
- Buying domains, tools, ads, or subscriptions
- Sending external messages
- Overwriting production assets
- Using secrets or credentials

## Website Pack Rule

The website pack must include at least three options unless the user asks for one:

- Option A: premium/conversion-focused
- Option B: operational/app-focused
- Option C: bold/experimental or SEO-maximal

For each option include:

- Visual thesis
- Sitemap
- Hero direction
- Core sections
- Funnel path
- Dashboard/app requirements
- Asset requirements
- Pros and risks

Once the user chooses, build that exact option. Do not blend options unless the user approves the blend.

## Validation Standard

Run the strongest available checks:

- Build/lint/type checks when available
- Route checks
- Form and CTA checks
- Responsive layout checks
- Browser screenshots when Playwright/Chromium is available
- PWA manifest and service worker checks when applicable
- Accessibility smoke checks
- SEO metadata checks

If browser tooling is blocked, state that clearly.

## QA Scoring

Score 1-100 after build and after hardening. Anything below 100 is not complete.

Use `references/qa-scorecard.md`.

## References

- `references/workflow-gates.md`: phase requirements and approval gates.
- `references/website-pack-template.md`: exact website pack structure.
- `references/brand-pack-template.md`: exact brand pack structure.
- `references/qa-scorecard.md`: validation scoring.
- `references/deployment-handoff.md`: release and handoff format.
- `references/account-rollout.md`: how to apply this skill across workspace agents.
