# Nashville Resin Worx Twilio + Metricool Social Bridge

Generated: 2026-06-08

## Purpose

Add a governed AUTO BUILDER bridge for Nashville Resin Worx social discovery, Metricool staging, HeyGen winner-video routing, Google Drive source-truth assets, and Twilio lead communications.

This bridge does not bypass governance. It creates the execution surface AUTO BUILDER needs so the upgraded MCP layer can inspect, draft, queue, validate, and execute approved actions with receipts.

## Verified Inputs

- Brand/account: Nashville Resin Worx
- Admin email: info@epoxywillchangeyourlife.com
- Twilio business phone number: +15616780328
- Twilio account SID was provided by the operator in the active session and must be configured through the approved secret/env channel.
- Drive source truth includes the Auto Social workbook and Nashville Resin Worx social automation docs.
- AUTO BUILDER repo: Strategic-Minds/AUTO_BUILDER
- Required daily operating cadence: 3 social operating runs per day.

## Bridge Scope

Included:

- Read social workbook/source truth.
- Produce 3x/day social content drafts.
- Produce approval-ready Metricool staging records.
- Produce engagement discovery and safe reply drafts.
- Route winning post concepts to HeyGen candidate queue.
- Send internal/admin lead alerts through Twilio after credentials are configured.
- Send customer SMS or place customer calls only after explicit approval and write flag validation.

Excluded until approval:

- Public social posting.
- Public auto-commenting.
- Direct messages to customers or prospects.
- Paid ads or boosts.
- Outbound SMS/calls to customers.
- Production env mutation.
- Secret value commits.

## Required Environment Variables

Metricool:

- METRICOOL_API_KEY
- METRICOOL_BRAND_ID
- METRICOOL_ALLOWED_PROFILES
- METRICOOL_WRITE_ENABLED

Twilio:

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_FROM_NUMBER
- TWILIO_ALLOWED_TO_NUMBERS
- TWILIO_STATUS_WEBHOOK_SECRET
- TWILIO_WRITE_ENABLED

Google Drive / Workspace:

- GOOGLE_WORKSPACE_CLIENT_ID
- GOOGLE_WORKSPACE_CLIENT_SECRET
- GOOGLE_WORKSPACE_REFRESH_TOKEN
- GOOGLE_DRIVE_ROOT_FOLDER_ID
- GOOGLE_DRIVE_WRITE_ENABLED

## Proposed Runtime Routes

Metricool:

- GET /api/bridge/metricool/status
- POST /api/bridge/metricool/analytics
- POST /api/bridge/metricool/draft-post
- POST /api/bridge/metricool/schedule-approved

Twilio:

- GET /api/bridge/twilio/status
- POST /api/bridge/twilio/draft-sms
- POST /api/bridge/twilio/draft-call
- POST /api/bridge/twilio/send-approved-sms
- POST /api/bridge/twilio/call-approved
- POST /api/webhooks/twilio/status

Nashville Social Queue:

- GET /api/bridge/nrw-social/status
- POST /api/bridge/nrw-social/discovery-run
- POST /api/bridge/nrw-social/engagement-triage
- POST /api/bridge/nrw-social/evening-optimization
- POST /api/bridge/nrw-social/approval-batch

## Approval Policy

Allowed autonomously:

- Source-truth reads.
- Social draft creation.
- Metricool-ready staging payloads.
- Twilio draft SMS/call receipts.
- Engagement classification.
- Internal approval batch creation.

Approval required:

- schedule_post
- publish_now
- public_comment
- send_dm
- send_sms
- place_call
- send_mms
- configure_webhook
- customer_notification
- paid_social_action

## 3x Daily Operating Cadence

Morning, 8:00 AM America/New_York:

- Inspect Drive source truth and approved assets.
- Create one primary post/reel concept.
- Create one supporting story/carousel concept.
- Include CTA to estimate form.
- Emit approval checklist.

Midday, 1:00 PM America/New_York:

- Discover local epoxy/concrete/resin conversations where allowed.
- Classify engagement opportunities.
- Draft safe public replies and DM handoff language.
- Do not post publicly without release approval.

Evening, 6:00 PM America/New_York:

- Summarize queue state and approval needs.
- Recommend Metricool slots.
- Identify HeyGen candidate ideas from winning concepts.
- Prepare next-day 3-post plan.

## Twilio Initial Use Cases

1. Admin new-estimate alert to the Nashville Resin Worx team.
2. Approved customer follow-up SMS after estimate submission.
3. Approved missed-call response.
4. Approved social lead handoff.

The initial business phone is +15616780328. Customer-facing actions must validate recipient allowlist, approval id, and TWILIO_WRITE_ENABLED=true before execution.

## Validation Requirements

- Connector status reports missing env names without exposing secret values.
- Draft SMS route creates receipt without sending.
- Draft call route creates receipt without placing a call.
- Approved SMS route rejects without approval id.
- Approved SMS route rejects when TWILIO_WRITE_ENABLED is not true.
- Approved call route rejects without recipient allowlist.
- Metricool route creates staging payload before live schedule.
- Social queue emits approval batch before public posting/commenting.

## Next Implementation Step

Promote the TypeScript contract in `src/lib/autobuilder-v2/nrw-social-twilio-bridge.ts`, then wire Next.js API routes to the shared AUTO BUILDER connector executor. Production posting, messaging, and calls remain blocked until env, connector validation, and operator approval are present.
