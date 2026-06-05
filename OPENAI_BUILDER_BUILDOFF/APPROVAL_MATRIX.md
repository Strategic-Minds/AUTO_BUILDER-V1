# Approval Matrix

## VERIFIED
- User forbids main mutation, deploy, env changes, production Supabase writes, Drive canon edits, publishing, HeyGen training, Shopify changes, email/SMS, and spend.

## INFERRED
- Unknown actions fail closed.

## COULD NOT VERIFY
- Final approver list.

## BLOCKERS
- No live mutation allowed.

## WORKAROUNDS
- Require explicit approval for all high-risk actions.

## NEXT ACTIONS
- Bind approvers later.

## Required Flags
- APPROVAL_REQUIRED=true
- PRODUCTION_MUTATION=false
- PUBLISHING_ENABLED=false
- DEPLOYMENT_ENABLED=false
- SHOPIFY_MUTATION_ENABLED=false
- HEYGEN_TRAINING_ENABLED=false

| Action | Default | Approval |
|---|---|---|
| Read sources | allowed | none |
| Branch docs | allowed | none |
| Disabled stubs | allowed | none |
| Sandbox branch commit | allowed | user already approved |
| PR | gated | operator |
| Preview deploy | blocked | operator |
| Merge main | blocked | operator |
| Production deploy | blocked | operator |
| Env change | blocked | operator |
| Supabase write | blocked | operator |
| Drive canon edit | blocked | operator |
| Shopify mutation | blocked | operator |
| HeyGen training | blocked | operator |
| Publish | blocked | operator |
| Email/SMS | blocked | operator |
| Spend | blocked | operator |
