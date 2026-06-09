# Eden Skye Studios Operating Backend Build

Status: branch-safe implementation for Vercel preview and Supabase migration review.

## Installed Surfaces

- `/admin/eden-skye`
- `/api/eden-skye/os`
- `/api/eden-skye/os/{discover|analyze|create|quarantine|approve|schedule|validate|heal|dispatch}`
- `/api/cron/eden-skye-five-minute`
- `supabase/migrations/20260609050000_eden_skye_operating_system.sql`

## Operating Model

Supabase becomes the live operating backend for models, assets, content, engagement, experiments, agent runs, memory, and receipts. Vercel serves the website/admin command center and five-minute validation heartbeat. GitHub remains the review, deployment, rollback, and source-truth layer.

## Safety Gates

The implementation is draft-first. It does not perform live publishing, outbound comments, replies, DMs, adult-content release, payment activation, Shopify/Xyla publication, n8n dispatch, or production Supabase migration.

## Next Validation

1. Open a PR from this branch.
2. Let Vercel build preview.
3. Smoke `/api/eden-skye/os` and every operation route.
4. Smoke `/admin/eden-skye`.
5. Confirm cron returns 401 when protected or receipts when authorized.
6. Approve Supabase migration separately before applying.
