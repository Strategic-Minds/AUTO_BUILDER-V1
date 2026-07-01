# Validation Matrix

## Completion Standard

100 means enterprise-grade and fully validated. Anything below 100 is incomplete.

## Required Checks

| Area | Check | Evidence Required | Blocks Release |
|---|---|---|---|
| Source coverage | All 21 routes represented | Route inventory and route smoke results | Yes |
| Visual quality | Desktop screenshots match source layout and visual hierarchy | Playwright screenshots at 1536px or CI equivalent | Yes |
| Responsive quality | Mobile and tablet routes usable with no overlap | Mobile/tablet screenshots | Yes |
| Forms | Lead, contact, and digital bid submit successfully | API response logs and UI test | Yes |
| Cron auth | Cron routes reject unauthenticated requests | `401` test result | Yes |
| Cron receipts | Authorized cron routes return structured receipt JSON | JSON receipt samples | Yes |
| Build | Next.js build succeeds | CI/build log | Yes |
| Secrets | No live secrets in Git | Secret scan result | Yes |
| SEO | Metadata, sitemap, robots, core schema present | Static check receipt | No, unless missing critical metadata |
| PWA | Manifest and install route exist | Manifest check and install route screenshot | No, unless PWA release is promised |
| Accessibility | Labels, focus states, contrast, keyboard nav | Manual + automated checklist | Yes for severe issues |
| Dashboards | Role pages render expected widgets | Route screenshots and data checks | Yes |
| Release | Vercel deployment validated | Preview/production receipt | Yes |

## QA Dimensions

- Frontend quality.
- Workflow integrity.
- Reliability and failure handling.
- Security posture.
- UX quality.
- Documentation completeness.
- Release readiness.

## Defect Severity Rules

- Critical: prevents build, release, core lead flow, cron security, or route availability.
- High: visible major UI defect, broken dashboard, missing validation evidence, or incomplete cron behavior.
- Medium: incomplete SEO/PWA polish, minor responsive issue, missing optional receipt field.
- Low: naming, copy, or minor style drift that does not affect conversion, safety, or workflow integrity.

## Browser Validation Plan

Run browser environment detection before claiming browser validation:

```bash
bash scripts/check_browser_env.sh
```

If Chromium is unavailable, attempt install only where permitted:

```bash
bash scripts/install_playwright.sh
```

Required viewports:

- Desktop: 1536 x 1024.
- Laptop: 1366 x 900.
- Tablet: 768 x 1024.
- Mobile: 390 x 844.

Minimum route screenshot set:

- `/`
- `/digital-bid`
- `/visualizer`
- `/design-center`
- `/locations`
- `/dashboard/customer`
- `/dashboard/crew`
- `/dashboard/supervisor`
- `/dashboard/owner`
- `/dashboard/admin`
- `/install`

## Release Gate

Release is blocked until:

- GitHub push/PR is approved and complete.
- Vercel env and cron setup are approved and complete.
- Browser validation runs in an actual Chromium-capable environment.
- QA score reaches 100, or the user explicitly accepts a known risk below 100.
