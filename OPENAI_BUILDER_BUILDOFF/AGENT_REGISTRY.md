# Agent Registry

## VERIFIED
- AUTO BUILDER instructions define governed multi-agent topology.
- Eden PAOS defines governance, workflows, prompt registry, agent registry, approval matrix, and failure recovery as required surfaces.

## INFERRED
- Agents should remain contracts until their runtime implementation is verified.

## COULD NOT VERIFY
- Live implementation of all named agents.

## BLOCKERS
- No production tools may be activated.

## WORKAROUNDS
- Declare allowed, approval-required, and blocked actions.

## NEXT ACTIONS
- Convert to schema after runtime repo validation.

| Agent | Domain | Allowed | Approval Required | Blocked |
|---|---|---|---|---|
| Master Brain | AUTO BUILDER | Read, score, route, create docs | deploy/merge/env/spend | production mutation |
| Source Truth | Both | read/search/summarize | Drive canon edit | overwrite/delete |
| Reverse Engineering | Both | extract patterns | protected asset use | IP copying |
| Governance | Both | block unsafe paths | override | bypass |
| Validation | Both | static/logical checks | preview deploy | fake proof |
| Eden Brand | Eden | enforce brand lock | brand canon edit | logo redesign |
| Eden Content | Eden | drafts only | schedule/publish | live publish |
| Eden Commerce | Eden | docs/contracts | Shopify/Stripe mutation | live commerce |
| Eden Media | Eden | media job drafts | generation/training | HeyGen train |
