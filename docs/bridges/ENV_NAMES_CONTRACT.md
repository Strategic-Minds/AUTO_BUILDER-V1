# Bridge Environment Names Contract

This file names required environment variables only. Do not commit secret values.

## Local Device Relay

- `AWOS_RELAY_PORT`: optional, defaults to `8795`.
- `AWOS_RELAY_ROOT`: local allowed repo root.
- `AWOS_RELAY_TOKEN`: bearer token for the relay.

## Cloud Bridge Runtime

- `AUTO_BUILDER_BRIDGE_TOKEN`: server-side bridge authentication token.
- `AUTO_BUILDER_ROUTER_URL`: cloud control-plane router URL.
- `AUTO_BUILDER_GPT_BRIDGE_SECRET`: optional GPT bridge shared secret.
- `AUTO_BUILDER_ADMIN_WRITE_ENABLED`: explicit switch for governed admin writes; defaults to disabled.
- `CRON_SECRET`: Vercel cron protection secret.

## Supabase

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key.
- `SUPABASE_ANON_KEY`: public anon key only where needed.
- `SUPABASE_BRIDGE_TABLE_ALLOWLIST`: comma-separated tables the Supabase bridge can touch.
- `SUPABASE_BRIDGE_RPC_ALLOWLIST`: comma-separated RPC names the Supabase bridge can call.

## Vercel And AI Runtime

- `VERCEL_OIDC_TOKEN`: provided by Vercel or pulled locally.
- `AI_GATEWAY_API_KEY`: optional fallback if OIDC is not used.
- `OPENAI_API_KEY`: server-only fallback where AI Gateway is not used.

## Connector Widening Names

- `SHOPIFY_ADMIN_TOKEN`
- `GITHUB_TOKEN`
- `BROWSER_WORKER_TOKEN`

## Google Chat Operator Bridge

- `GOOGLE_CHAT_WEBHOOK_URL`: approved incoming webhook URL for operator alerts.
- `GOOGLE_CHAT_SPACE_ID`: optional target space identifier for API-based bot routing.
- `GOOGLE_CHAT_BOT_TOKEN`: optional bot token if the stack moves beyond webhook-only alerts.

## Deferred Payment Bridge

- `STRIPE_SECRET_KEY`: deferred until payday/finance phase. Shopify Payments remains the active commerce payment surface for now.

## Removed Default Channel

- `SLACK_BOT_TOKEN` is intentionally not part of the active bridge contract.

## Rule

Values belong in Vercel environment variables, local `.env.local`, or approved secret stores. This repo stores names, scopes, and validation rules only.
