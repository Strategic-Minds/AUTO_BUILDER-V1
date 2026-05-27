# Release Bridge Packet

## Repo Target And Branch Plan
- Repository: `Strategic-Minds/AUTO_BUILDER`
- Base branch: `main`
- Production branch: `main`
- Connected Vercel project: `auto-builder`
- Connected production domain: `auto-builder-livid.vercel.app`

## Deployment Order
1. Confirm `main` contains the intended release commit in `Strategic-Minds/AUTO_BUILDER`
2. Trigger a fresh production deployment only if code changes require it
3. Apply Supabase migration `202605270001_init_auto_builder.sql`
4. Export docs pack to Google Drive folder `AUTO_BUILDER` (`16AQrLRxnqP6fKxzlBI9hJ1xeEKnuYF9b`)
5. Run production validation against the live Vercel app

## Smooth Workarounds
- If Vercel deployment cannot be triggered from this runtime: use the currently healthy production deployment as the validation baseline and reserve redeploy for a write-capable runtime
- If Supabase approval or connector access stalls again: keep the migration file and release packet as the operator handoff source, then retry from a write-capable runtime
- If Drive export is blocked: use the packaged docs zip as the handoff artifact and target Drive folder `16AQrLRxnqP6fKxzlBI9hJ1xeEKnuYF9b` once write access is available
- If browser-level public verification is blocked from this sandbox: complete connector-based route validation and finish visual checks from the platform surface
