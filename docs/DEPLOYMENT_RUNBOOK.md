# Deployment Runbook

## Canonical Vercel Settings
- Framework Preset: `Next.js`
- Root Directory: blank
- Output Directory: blank
- Install Command: `npm install`
- Build Command: `npm run build`
- Node.js Version: `24.x`
- Production Branch: `main`

## Stability Rules
- Do not set `outputDirectory` for this repo.
- Keep `vercel.json` limited to settings that truly need repo control, such as cron entries.
- Keep production aliases pointed at the latest successful production deployment.

## Smoke Tests
Run these after every production deploy:
- `GET /`
- `GET /api/health`

Expected results:
- `/` returns the AUTO BUILDER Bridge homepage
- `/api/health` returns JSON with `status`, `app`, `deployment`, `repos`, and `providers`

## Health Contract
The health endpoint should expose:
- app name
- app version
- commit SHA
- commit ref
- environment
- deployment URL

## Deployment Sources of Truth
- Repo root `package.json`
- Repo root `vercel.json`
- `next.config.js`
- `src/app/api/health/route.ts`

## Common Failure Modes
1. Framework preset changed away from `Next.js`
2. Root directory changed away from repo root
3. Output directory manually set in Vercel
4. `vercel.json` reintroduces `outputDirectory`
5. Required provider secrets missing in Vercel project settings
6. Cron routes changed without matching runtime auth or handler validation

## Release Checklist
1. Confirm `main` contains the intended commit
2. Confirm Vercel project settings still match the canonical values above
3. Verify the latest production deployment is `READY`
4. Check `/`
5. Check `/api/health`
6. If provider changes were included, verify the affected secret names exist in Vercel settings
