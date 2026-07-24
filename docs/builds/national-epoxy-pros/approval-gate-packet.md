# Approval Gate Packet

## Current Phase

DOCS pushed to GitHub branch. BUILD and external mutations require explicit approval.

## Approval Needed For

1. Merging the Auto Builder docs PR.
2. Creating implementation branch or PR in the deployable app repo.
3. Adding or changing `vercel.json` in the deployable app repo.
4. Creating Vercel cron routes.
5. Adding Vercel environment variables.
6. Triggering Vercel deployment.
7. Creating Supabase tables or queue records.
8. Writing receipts to Google Drive.

## Recommended Approval Sequence

### Approval 1: Stage GitHub Docs and PR

Phrase:

`APPROVE NATIONAL EPOXY PROS AUTO BUILDER GITHUB STAGING`

Allowed:

- Create branch.
- Commit docs.
- Open draft PR.

Still blocked:

- Vercel env mutation.
- Production deploy.
- Supabase mutation.

### Approval 2: Stage Vercel Cron Workflow

Phrase:

`APPROVE NATIONAL EPOXY PROS VERCEL CRON STAGING`

Allowed:

- Add cron config to the deployable app repo.
- Add cron route handlers.
- Configure required env vars if provided.
- Deploy preview.

Still blocked:

- Production promotion.
- Supabase writes unless separately approved.

### Approval 3: Production Release

Phrase:

`APPROVE NATIONAL EPOXY PROS PRODUCTION DEPLOYMENT`

Allowed:

- Promote validated Vercel deployment.
- Enable approved crons in production.
- Write release receipt.

Required before approval:

- QA score 100 or explicit accepted-risk release note.
- Build and browser validation evidence.
- Secret scan.
- Rollback plan.

## Rollback Plan

- Revert GitHub PR or deployment commit.
- Disable cron entries in `vercel.json`.
- Remove or rotate `CRON_SECRET` if exposed.
- Disable Supabase write workers if enabled.
- Restore prior Vercel deployment.
- Write rollback receipt after action.
