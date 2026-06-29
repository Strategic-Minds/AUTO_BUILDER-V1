# MCP and Tool Package Registry

## Tool classes
- repo tools: GitHub, Codex, branch, PR, issue, actions
- deploy tools: Vercel, preview, logs, cron
- database tools: Supabase migrations, RLS, storage, edge functions
- workspace tools: Google Drive, Docs, Sheets, Forms, Gmail, Calendar, Chat
- marketing tools: Metricool, Klaviyo, HubSpot, Shopify
- media tools: HeyGen, Runway, image generation, video generation
- communication tools: Slack, Google Chat, Gmail
- payment tools: Stripe, Shopify payments

## Tool contract
Every tool must define:
- tool_name
- owner
- allowed_actions
- gated_actions
- dry_run_available
- rollback_available
- receipt_required
- secrets_required
- production_risk
- approval_gate
- fallback_tool

## Always blocked without approval
payments, live customer messages, social publishing, DNS, production deploys, database destructive actions, secrets, spend.
