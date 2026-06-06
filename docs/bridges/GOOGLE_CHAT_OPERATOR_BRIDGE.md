# Google Chat Operator Bridge

Google Chat is the selected operator messaging bridge for AWOS because the rest of the active operating stack is Google-first.

## Purpose

- Send operator alerts, approval prompts, smoke summaries, blocker reports, and daily/weekly system status into Google Chat.
- Keep GPT/AUTO BUILDER as the orchestration brain and Google Chat as the operator notification surface.
- Avoid Slack-specific implementation work unless the operator explicitly reverses the channel decision.

## Initial Mode

Webhook-first, read-light, approval-gated writes.

Autonomous actions:

- Draft a Google Chat operator update.
- Format approval cards or blocker summaries.
- Queue a notification receipt.
- Report Google Chat env-name presence through `/api/bridge/env-names`.

Gated actions:

- Send a live Google Chat message.
- Reply to a thread.
- Change Google Chat space or bot configuration.
- Store or rotate webhook/bot secrets.

## Environment Names

- `GOOGLE_CHAT_WEBHOOK_URL`
- `GOOGLE_CHAT_SPACE_ID`
- `GOOGLE_CHAT_BOT_TOKEN`

## Smoke Order

1. Env names only: confirm names/presence, never values.
2. Draft-only message receipt.
3. Webhook route dry run.
4. Approved test message to a low-risk operator space.
5. Receipt persistence.
6. Error and retry handling.

## Governance

Google Chat outbound messages are external mutations. They require approval until the operator explicitly authorizes recurring alerts or scheduled notifications.
