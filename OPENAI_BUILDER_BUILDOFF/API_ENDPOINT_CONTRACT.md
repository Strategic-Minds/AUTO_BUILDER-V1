# API Endpoint Contract

## VERIFIED
- Detailed disabled stubs exist in Eden branch commit `a6875281dfe3632ed5d33bd0ea70aa4b342324bd`.
- This AUTO_BUILDER branch is a canonical control package.

## INFERRED
- AUTO_BUILDER should expose status/validate endpoints only after checkout/build validation.

## COULD NOT VERIFY
- Current app route root convention in AUTO_BUILDER.

## BLOCKERS
- No deploy or local build.

## WORKAROUNDS
- Contract only here; disabled stubs live in Eden detailed branch.

## NEXT ACTIONS
- Validate route placement in morning.

## Contract
- `GET /api/openai-builder-buildoff/status`: returns branch, verdict, flags, no live actions.
- `POST /api/openai-builder-buildoff/validate`: accepts dry-run validation request, refuses unsafe flags.
- `/admin/openai-builder-buildoff`: disabled dashboard surface.

## Hard Flags
- APPROVAL_REQUIRED=true
- PRODUCTION_MUTATION=false
- PUBLISHING_ENABLED=false
- DEPLOYMENT_ENABLED=false
- SHOPIFY_MUTATION_ENABLED=false
- HEYGEN_TRAINING_ENABLED=false
