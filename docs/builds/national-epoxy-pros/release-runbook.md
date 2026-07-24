# Release Runbook

## Stage 1: Control Plane

1. Commit Auto Builder docs to `Strategic-Minds/AUTO_BUILDER`.
2. Confirm execution packet is valid JSON.
3. Confirm all protected actions remain approval-gated.
4. Create draft PR or staged branch.

## Stage 2: App Build

1. Confirm target app repo.
2. Add or update route files.
3. Add component system.
4. Add mock-first API routes.
5. Add cron route handlers.
6. Add `vercel.json`.
7. Add `.env.example`.
8. Run install, lint/typecheck/build where available.

## Stage 3: Preview

1. Deploy Vercel preview after approval.
2. Validate public routes.
3. Validate dashboard routes.
4. Validate forms.
5. Validate cron route authentication.
6. Validate PWA manifest and install route.

## Stage 4: Browser QA

1. Run Playwright/Chromium environment check.
2. Capture desktop/tablet/mobile screenshots.
3. Compare source-truth collage and per-route screenshots.
4. Log defects.
5. Fix defects.
6. Re-run validation until QA score reaches 100 or blocker is declared.

## Stage 5: Production Release

1. Confirm production approval phrase.
2. Promote deployment.
3. Enable approved crons.
4. Verify production route health.
5. Verify production cron auth.
6. Write release receipt.

## Stage 6: Monitoring

1. Daily receipt rollup.
2. Weekly open-gap review.
3. SEO observation every six hours.
4. Validation sweep every thirty minutes.
5. Human review for any critical/high defect.
