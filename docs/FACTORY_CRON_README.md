# AutoBuilder Epoxy Factory — Cron Pipeline

## How It Works

The `/api/cron/auto-builder` route runs every 5 minutes via Vercel cron.

### Pipeline Steps (fully automated)
1. **Poll Supabase** for next job with `stage = "queued"` in `factory_project_queue`
2. **Discovery** — market analysis, keyword targeting, XPS product matching
3. **Design** — competitor gap analysis (OX Floors, Stronghold, Quality Epoxy), dark/gold premium system
4. **Generate HTML** — complete 12-section site with all XPS CDN images, working buttons, modals
5. **QA** — validate HTML size, images, forms, mobile-responsive structure
6. **Deploy to Vercel** — new project per city, READY in ~4 seconds
7. **Push to GitHub** — `Strategic-Minds/national-epoxy-pros` cities/ folder
8. **Notify Slack** — posts live URL to #apex-builds
9. **Write receipt** — Supabase agent_memory + factory_project_queue update

## To Queue a New City
POST to `/api/factory/idea-intake` with:
```json
{ "idea": "Dallas TX commercial floors", "source": "operator" }
```
The cron picks it up within 5 minutes.

## To Enable Live Deploys
Set in Vercel environment variables:
```
AUTO_BUILDER_MODE=live
```
Default is `dry_run` (safe — no real deploys until you flip this).

## Cities Already Deployed
- Phoenix, AZ — https://nep-live.vercel.app ✅ LIVE
