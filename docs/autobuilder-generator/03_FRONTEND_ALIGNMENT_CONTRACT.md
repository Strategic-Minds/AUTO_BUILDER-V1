# Frontend Alignment Contract

## Purpose

Align v0 with the AUTO BUILDER Generator Factory so the frontend becomes a command/status surface instead of a separate manual UI.

## Current v0 State

- `/bridges` exists.
- Frontend sync panel exists.
- Bridge/action surfaces exist.
- Google Chat is displayed as selected.
- Stripe is displayed as deferred.
- Shopify Commerce and Payments is displayed as active for the current phase.
- Command bridge is linked to AUTO BUILDER.

## Required v0 Additions

- Generator Factory action link.
- Generator status panel.
- Build packet viewer.
- Queue/receipt viewer.
- Approval gate panel.
- Browser smoke evidence panel.
- Google Chat draft alert panel.
- Phone-first command form that submits to `/api/bridge/command`.

## Read Sources

v0 may read these AUTO BUILDER routes:

- `/api/bridge/registry`
- `/api/bridge/env-names`
- `/api/bridge/repo-visibility`
- `/api/bridge/command`
- `/api/bridge/supabase-admin`
- `/api/bridge/smoke`
- `/api/cron/autobuilder-generator`

## Write Path

v0 writes only through the token-authenticated AUTO BUILDER command route:

- `/api/bridge/command`

Persistent execution remains blocked unless:

- bearer token is configured
- `AUTO_BUILDER_ADMIN_WRITE_ENABLED=true`
- the command is policy-allowed
- risk class 2+ includes approval ID
- target bridge allowlists permit the operation

## Visual Acceptance Criteria

- v0 shows generator state without requiring copy/paste.
- v0 links to the current command-enabled AUTO BUILDER preview.
- v0 makes read/write boundaries obvious.
- v0 does not imply direct GitHub, Vercel, Supabase, Shopify, Stripe, Google Chat, or browser mutation.
- Mobile layout keeps action surfaces scannable.

## Next Frontend Build Step

Add a Generator Factory section to `/bridges` that renders the generator route URL, current state, next queue lane, smoke state, and approval requirements.
