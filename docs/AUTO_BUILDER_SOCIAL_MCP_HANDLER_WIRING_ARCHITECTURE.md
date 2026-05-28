# AUTO BUILDER SOCIAL MCP HANDLER WIRING ARCHITECTURE

## Purpose
Define implementation architecture for wiring packet-only and receipt-only social helpers into the AUTO BUILDER MCP route.

## Current Runtime Helpers
1. src/lib/autobuilder/social-governance.ts
2. src/lib/autobuilder/social-status.ts
3. src/lib/autobuilder/social-receipts.ts
4. src/lib/autobuilder/social-packets.ts

## Handler Registration Structure
Register MCP handlers for:
1. create_social_post_packet
2. create_facebook_post_packet
3. create_engagement_reply_packet
4. create_repurpose_distribution_packet
5. record_social_post_receipt
6. get_social_content_queue_status
7. social_governance_preflight

## Helper Import Boundaries
MCP route may import:

```ts
import { createSocialPostPacket } from '@/lib/autobuilder/social-packets';
import { socialGovernancePreflight } from '@/lib/autobuilder/social-governance';
import { createSocialReceipt } from '@/lib/autobuilder/social-receipts';
import { getSocialContentQueueStatus } from '@/lib/autobuilder/social-status';
```

These helpers are packet-only, receipt-only, or status-only.

## Envelope Integration
Every handler must return a governed response envelope:

```json
{
  "tool": "tool_name",
  "status": "ok | blocked | approval_required | error",
  "mode": "packet_only | receipt_only | status_only",
  "livePublished": false,
  "autoEngagementPerformed": false,
  "approvalRequired": true,
  "result": {},
  "receipt": null,
  "blockers": [],
  "nextStep": "string"
}
```

## Governance Preflight Execution Order
1. Receive tool input.
2. Run socialGovernancePreflight.
3. If blocked, return blocked envelope.
4. If live publish requested, return approval_required envelope.
5. If safe packet/status/receipt, create packet, status, or receipt.
6. Return envelope.
7. Do not call external publishing APIs.

## Queue Integration Points
Future queue layer should write only after approval:
1. packet_created
2. waiting_for_review
3. waiting_for_receipt
4. blocked
5. receipt_recorded

No queue persistence is required for first MCP wiring pass.

## Receipt Persistence Strategy
First pass:
1. Return receipt in MCP response only.
2. Do not persist externally.

Future pass:
1. Persist receipt to Supabase or Ops Sheet after approved schema and connector validation.
2. Preserve postUrl, platform, status, publishedAt, notes, and attribution metadata.

## Recursive Continuity Integration
Every handler response must include nextStep. The nextStep should tell AUTO BUILDER what to do next without requiring Jeremy to retype context.

## Protected Boundaries
Handlers must not:
1. publish live
2. auto-DM
3. mass-engage
4. mutate account settings
5. change billing
6. perform Stripe money movement
7. perform Shopify writes
8. change Vercel env
9. change Supabase schema
10. bypass platform controls

## Recommended Implementation Order
1. Add shared social envelope helper if needed.
2. Register social_governance_preflight.
3. Register get_social_content_queue_status.
4. Register create_social_post_packet.
5. Register create_facebook_post_packet.
6. Register create_engagement_reply_packet.
7. Register create_repurpose_distribution_packet.
8. Register record_social_post_receipt.
9. Validate tools in GPT MCP.
10. Only then plan connector execution.

## Completion Criteria
1. MCP tools appear.
2. Tools return packet/status/receipt only.
3. Live actions remain disabled.
4. Protected actions are blocked or approval-required.
5. Every response includes nextStep.
