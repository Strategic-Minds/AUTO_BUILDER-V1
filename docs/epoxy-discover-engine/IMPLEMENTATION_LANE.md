# Epoxy Discover Engine Implementation Lane

## Canonical Targets

- GitHub repo: `Strategic-Minds/AUTO_BUILDER`
- Vercel project: `auto-builder`
- Vercel project ID: `prj_qaUnGOL4MmPvm11Hqxp9Cn0YDfmv`
- Supabase project: `Strategic Minds Advisory`
- Supabase project ref: `prhppuuwcnmfdhwsagug`
- Google Sheet: `Epoxy Competitor Intelligence Master Sheet`
- Cron route: `/api/cron/epoxy-competitor-queue`
- Preview validation route: `/api/preview/epoxy-competitor-queue-dry-run`
- Cron cadence: every 5 minutes

## Release Gates

This lane is branch-safe and dry-run-first. It must not mutate production Supabase or the production Google Sheet until release approval is granted.

Required live-write env gates:

- `EPOXY_DISCOVER_RELEASE_APPROVED=1`
- `EPOXY_DISCOVER_PERSISTENCE_ENABLED=1`
- `EPOXY_DISCOVER_DRY_RUN_DEFAULT=0`
- `EPOXY_SHEET_SYNC_ENABLED=1`
- `EPOXY_SHEET_SYNC_WEBHOOK_URL`
- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_KEY`, or `SUPABASE_SECRET_KEY`

Cron auth uses the existing control-plane helper and accepts `CRON_SECRET` or `CRON_API_TOKEN`.

The preview validation route is disabled in production, always forces `dryRun: true`, and exists only to validate branch previews when the cron token cannot be sent through the available preview fetch tooling.

## Dry-Run Validation

Run:

```bash
npm run validate:epoxy-discover-engine
```

Dry-run endpoint example:

```text
/api/cron/epoxy-competitor-queue?dryRun=1&state=TX&maxCandidates=3
```

Preview fallback endpoint example:

```text
/api/preview/epoxy-competitor-queue-dry-run?state=TX&maxCandidates=3
```

Expected behavior:

- Builds one state queue job.
- Emits dry-run competitor candidates from uploaded benchmark seed data.
- Prepares State Master, Queue, and Competitor Master sheet rows.
- Builds a receipt.
- Skips Supabase writes and sheet writes.
- Keeps `productionActionAllowed` false.

## Production Release Checklist

Before release:

- Review and approve `supabase/migrations/0004_epoxy_discover_engine_draft.sql`.
- Apply the migration only through the approved Supabase release path.
- Confirm explicit grants and RLS policies with Supabase advisors.
- Configure Vercel env vars.
- Confirm the Google Sheet sync webhook and secret.
- Run the dry-run endpoint in preview.
- Capture receipt evidence in the Drive receipts folder.
- Approve production deployment separately.
