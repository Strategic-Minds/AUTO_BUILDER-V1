# Eden Shopify V1 Branch Reference

## Purpose

Auto Builder agents must use the dedicated Eden Skye Studios Shopify V1 preview branch when editing, generating, validating, or documenting the public Shopify website.

## Required Repo And Branch

Repository:

```text
Strategic-Minds/EDENSKYESTUDIOS
```

Branch:

```text
shopify/v1-website-preview
```

## Rule

All Shopify V1 public website edits must happen on `shopify/v1-website-preview` unless Jeremy explicitly names a different branch in the current session.

This applies to:

- Shopify storefront source
- Shopify theme source
- public website mockup-match work
- creator/download/product/service storefront sections
- Shopify preview preparation
- Shopify website validation docs
- screenshot and visual proof receipts

## Approved Mockup

The approved mockup is:

```text
EDENSKYEWEBSITEV2.png
```

Auto Builder may not mark the Shopify V1 website complete until screenshot evidence proves the branch output matches the approved mockup structure.

## Screenshot Proof Requirement

Every meaningful visual edit requires:

- desktop screenshot near `1920x1243`
- mobile screenshot near `390x844`
- visual diff or side-by-side proof against `EDENSKYEWEBSITEV2.png` when available
- validation receipt or handoff note explaining the result

## Validation Workflow

Use or dispatch:

```text
eden-mockup-visual-validation.yml
```

Required validation mode:

```text
strict
```

Default threshold:

```text
0.5% pixel mismatch maximum
```

## Governance

This branch does not authorize:

- Shopify publish
- production deploy
- Shopify product/price/discount/payment mutation
- public publishing
- destructive GitHub/Drive/Supabase actions

Those actions remain approval-gated.

## Agent Instruction

Before any Auto Builder agent touches Eden Shopify V1 work, it must inspect:

1. `Strategic-Minds/EDENSKYESTUDIOS` branch `shopify/v1-website-preview`
2. `docs/SHOPIFY_V1_PREVIEW_BRANCH.md`
3. `AGENTS.md`
4. `README.md`
5. approved mockup-match docs
6. latest screenshot proof or validation artifact
