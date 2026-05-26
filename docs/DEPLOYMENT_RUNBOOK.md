# Deployment Runbook

## Canonical Vercel Settings
- Framework Preset: `Next.js`
- Root Directory: blank
- Output Directory: blank
- Install Command: `npm install`
- Build Command: `npm run build`
- Node.js Version: `24.x`
- Production Branch: `main`

## Governance References
Deployment and live operation must follow:
- `SYSTEM_SOURCE_OF_TRUTH.md`
- `AUTONOMY_AND_APPROVAL_MATRIX.md`
- `FINANCIAL_OPERATING_RULES.md`
- `PROFIT_OPTIMIZATION_PLAYBOOK.md`

## Stability Rules
- Do not set `outputDirectory` for this repo.
- Keep `vercel.json` limited to settings that truly need repo control, such as cron entries.
- Keep production aliases pointed at the latest successful production deployment.
- Preserve maximum controlled autonomy without sacrificing rollback, validation, or financial discipline.
- If a deployment path breaks, seek the strongest alternate execution path before stopping.

## Profit And Autonomy Doctrine
- Deployments should support revenue, margin, automation, and operator leverage.
- Do not accept low-capability or low-profit operating shapes when a stronger governed architecture is possible.
- Always prefer stronger health visibility, stronger workflow power, stronger fallback surfaces, and stronger operating speed.

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
- the four-file governance architecture listed above

## Common Failure Modes
1. Framework preset changed away from `Next.js`
2. Root directory changed away from repo root
3. Output directory manually set in Vercel
4. `vercel.json` reintroduces `outputDirectory`
5. Required provider secrets missing in Vercel project settings
6. Cron routes changed without matching runtime auth or handler validation
7. System drift away from maximum controlled autonomy or profitability priorities

## Release Checklist
1. Confirm `main` contains the intended commit
2. Confirm Vercel project settings still match the canonical values above
3. Verify the latest production deployment is `READY`
4. Check `/`
5. Check `/api/health`
6. If provider changes were included, verify the affected secret names exist in Vercel settings
7. Confirm the release did not weaken capability, governance, or profitability posture
