# AUTO BUILDER SOCIAL MCP ROUTE IMPLEMENTATION PLAN

## Purpose
Define the exact implementation plan for adding packet-only, receipt-only, and status-only social MCP tools into `src/app/api/mcp/route.ts`.

## Current MCP Route Shape
The current route uses:

```ts
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
    server.registerTool(...);
  },
  { instructions: "..." },
  { basePath: "/api", maxDuration: 60, verboseLogs: false }
);
```

## Insertion Points
1. Add social helper imports after existing imports.
2. Add a local `socialEnvelope` helper near other helper functions.
3. Register social tools after `get_governance_policy` and before resources/prompts.
4. Keep all tools packet-only, receipt-only, or status-only.

## Required Imports

```ts
import { socialGovernancePreflight } from "@/lib/autobuilder/social-governance";
import { createSocialPostPacket } from "@/lib/autobuilder/social-packets";
import { createSocialReceipt } from "@/lib/autobuilder/social-receipts";
import { getSocialContentQueueStatus } from "@/lib/autobuilder/social-status";
```

## Shared Envelope Helper

```ts
function socialEnvelope(args: {
  tool: string;
  status?: "ok" | "blocked" | "approval_required" | "error";
  mode: "packet_only" | "receipt_only" | "status_only";
  result: unknown;
  receipt?: unknown;
  blockers?: string[];
  nextStep: string;
}) {
  return {
    tool: args.tool,
    status: args.status ?? "ok",
    mode: args.mode,
    livePublished: false,
    autoEngagementPerformed: false,
    approvalRequired: args.status === "approval_required",
    result: args.result,
    receipt: args.receipt ?? null,
    blockers: args.blockers ?? [],
    nextStep: args.nextStep
  };
}
```

## Handler Dispatch Strategy
Each tool must:
1. Receive input.
2. Run governance preflight when relevant.
3. Return blocked or approval-required envelope when needed.
4. Return packet/status/receipt output only.
5. Never call external social publishing APIs.
6. Never send DMs or comments.
7. Always include nextStep.

## Tool Registration Order
1. `social_governance_preflight`
2. `get_social_content_queue_status`
3. `create_social_post_packet`
4. `create_facebook_post_packet`
5. `create_engagement_reply_packet`
6. `create_repurpose_distribution_packet`
7. `record_social_post_receipt`

## Tool Contracts

### social_governance_preflight
Input:
```ts
{
  action: z.string(),
  livePublish: z.boolean().optional(),
  autoDm: z.boolean().optional(),
  massEngage: z.boolean().optional(),
  accountMutation: z.boolean().optional()
}
```
Output: status-only envelope.

### get_social_content_queue_status
Input: `{}`
Output: status-only envelope.

### create_social_post_packet
Input:
```ts
{
  platform: z.string().optional(),
  pillar: z.enum(["authority", "proof", "cta"]),
  hook: z.string(),
  caption: z.string(),
  cta: z.string(),
  visual: z.string()
}
```
Output: packet-only envelope.

### create_facebook_post_packet
Input:
```ts
{
  pillar: z.enum(["authority", "proof", "cta"]),
  hook: z.string(),
  caption: z.string(),
  cta: z.string(),
  visual: z.string()
}
```
Output: packet-only envelope with platform `facebook`.

### create_engagement_reply_packet
Input:
```ts
{
  commentType: z.enum(["lead", "question", "complaint", "spam", "support", "testimonial", "general"]),
  commentText: z.string(),
  replyTone: z.enum(["professional", "friendly", "concise"]).optional()
}
```
Output: packet-only draft reply. No live reply.

### create_repurpose_distribution_packet
Input:
```ts
{
  sourceAsset: z.string(),
  targetPlatforms: z.array(z.string()),
  caption: z.string(),
  cta: z.string()
}
```
Output: packet-only distribution packet.

### record_social_post_receipt
Input:
```ts
{
  platform: z.string(),
  status: z.string(),
  postUrl: z.string().optional(),
  publishedAt: z.string().optional(),
  notes: z.string().optional()
}
```
Output: receipt-only envelope.

## Queue Integration Points
First pass does not persist queue state. It should return only:
1. `packet_mode`
2. `waiting_for_review`
3. `waiting_for_receipt`
4. `blocked`
5. `receipt_recorded`

Future pass may persist to Supabase after schema approval.

## Recursive Next-Step Generation
Each response must contain a nextStep such as:
- `Review packet and approve exact publish action or request revision.`
- `Route packet to Repurpose/Xyla/Facebook connector after connector validation.`
- `Record published post URL as receipt.`
- `Analyze receipt and generate next packet.`

## Protected Boundaries
The implementation must not:
1. publish live
2. auto-DM
3. mass-engage
4. mutate account settings
5. call Facebook/Xyla/Repurpose APIs
6. store credentials
7. change billing
8. change deployments
9. mutate Supabase schema
10. mutate Shopify or Stripe

## Validation Plan
1. Build passes.
2. MCP route still exports GET, POST, DELETE.
3. Existing tools still register.
4. New tools appear in GPT MCP.
5. Each new tool returns packet/status/receipt only.
6. Protected action inputs return blocked or approval-required.

## Completion Criteria
The route is ready when all seven social MCP tools are visible and return governed envelopes without live external actions.
