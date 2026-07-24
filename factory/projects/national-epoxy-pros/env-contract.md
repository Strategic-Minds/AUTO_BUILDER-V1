# Environment Contract

## Required For Build

- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPPORT_PHONE`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_LEADS_EMAIL`
- `CRON_SECRET`
- `AUTO_BUILDER_EXECUTION_MODE`

## Required For Auto Builder Integration

- `AUTO_BUILDER_OPERATOR_TOKEN`
- `AUTO_BUILDER_BRIDGE_TOKEN`
- `GITHUB_TOKEN`
- `GITHUB_ORG`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `OPENAI_API_KEY`
- `AI_GATEWAY_API_KEY`

## Required For Supabase When Approved

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Optional

- `GOOGLE_SEARCH_CONSOLE_SITE_URL`
- `PAGESPEED_API_KEY`
- `CRUX_API_KEY`
- `SERP_API_KEY`
- `CRM_WEBHOOK_URL`
- `SLACK_WEBHOOK_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`

## Secret Rules

- Never commit live secrets to Git.
- `.env.example` must contain names only, never secret values.
- Cron routes must fail closed when `CRON_SECRET` is missing.
- Service-role keys must only be used server-side.
- Production env changes require explicit approval.

## Suggested `.env.example`

```bash
NEXT_PUBLIC_SITE_NAME="National Epoxy Pros"
NEXT_PUBLIC_SITE_URL="https://xpswebsites.vercel.app"
NEXT_PUBLIC_SUPPORT_PHONE="(877) 958-6408"
NEXT_PUBLIC_SUPPORT_EMAIL="support@nationalepoxypros.com"
NEXT_PUBLIC_LEADS_EMAIL="leads@nationalepoxypros.com"
CRON_SECRET=""
AUTO_BUILDER_EXECUTION_MODE="dry_run"
AUTO_BUILDER_OPERATOR_TOKEN=""
AUTO_BUILDER_BRIDGE_TOKEN=""
GITHUB_TOKEN=""
GITHUB_ORG="Strategic-Minds"
VERCEL_TOKEN=""
VERCEL_TEAM_ID=""
GOOGLE_CLIENT_EMAIL=""
GOOGLE_PRIVATE_KEY=""
GOOGLE_DRIVE_ROOT_FOLDER_ID=""
OPENAI_API_KEY=""
AI_GATEWAY_API_KEY=""
SUPABASE_URL=""
SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```
