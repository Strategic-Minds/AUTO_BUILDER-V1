# AUTO BUILDER SOCIAL MCP TOOL REGISTRATION CONTRACTS

## Purpose
Define packet-only and receipt-only MCP social tool contracts for governed social automation.

## Tools
1. create_social_post_packet
2. create_facebook_post_packet
3. create_engagement_reply_packet
4. create_repurpose_distribution_packet
5. record_social_post_receipt
6. get_social_content_queue_status
7. social_governance_preflight

## Governance Boundary
These tools must not publish live, auto-DM, mass-engage, or mutate account settings. Live publishing requires exact approval and verified connector execution.

## Shared Response Envelope
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
  "nextStep": "exact next governed step"
}
```

## create_social_post_packet
Input:
```json
{
  "platform": "facebook | instagram | tiktok | youtube | xyla | other",
  "pillar": "authority | proof | cta",
  "hook": "string",
  "caption": "string",
  "cta": "string",
  "visual": "string"
}
```
Output: SocialPacket.

## create_facebook_post_packet
Input:
```json
{
  "pillar": "authority | proof | cta",
  "hook": "string",
  "caption": "string",
  "cta": "string",
  "visual": "string"
}
```
Output: SocialPacket with platform facebook.

## create_engagement_reply_packet
Input:
```json
{
  "commentType": "lead | question | complaint | spam | support | testimonial | general",
  "commentText": "string",
  "replyTone": "professional | friendly | concise"
}
```
Output: Draft reply only. No live reply.

## create_repurpose_distribution_packet
Input:
```json
{
  "sourceAsset": "string",
  "targetPlatforms": ["facebook", "instagram", "tiktok", "youtube", "xyla"],
  "caption": "string",
  "cta": "string"
}
```
Output: Repurpose distribution packet only.

## record_social_post_receipt
Input:
```json
{
  "platform": "string",
  "status": "not_published | scheduled | published | blocked",
  "postUrl": "string optional",
  "publishedAt": "ISO optional",
  "notes": "string optional"
}
```
Output: SocialReceipt.

## get_social_content_queue_status
Input: none.
Output: social content queue status.

## social_governance_preflight
Input:
```json
{
  "action": "string",
  "livePublish": false,
  "autoDm": false,
  "massEngage": false,
  "accountMutation": false
}
```
Output: governance classification.

## Queue State
```json
{
  "queue": "social_content_queue",
  "status": "packet_mode | waiting_for_receipt | blocked | ready_for_review",
  "livePublishingEnabled": false,
  "autoEngagementEnabled": false,
  "nextStep": "string"
}
```

## Completion Criteria
1. Tools register in MCP.
2. Tools return packets, receipts, or status only.
3. Protected actions are blocked or approval-required.
4. No live social action occurs from these tools.
