# API and Data Contract

## First-Build API Routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/leads` | Create homepage/contact lead. |
| `POST` | `/api/digital-bid` | Create digital bid submission. |
| `GET` | `/api/floor-systems` | List floor systems. |
| `GET` | `/api/design-center/colors` | List color charts and swatches. |
| `GET` | `/api/locations` | Search locations. |
| `GET` | `/api/gallery` | Return project gallery items. |
| `GET` | `/api/dashboard/[role]` | Return dashboard mock data by role. |
| `POST` | `/api/pwa/install-event` | Capture install intent. |

## Cron API Routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/cron/nep/factory-readiness` | Env, manifest, approval, and queue readiness. |
| `GET` | `/api/cron/nep/source-sync` | Source docs and route manifest normalization. |
| `GET` | `/api/cron/nep/seo-observation` | Sitemap, metadata, schema, search-observation tasks. |
| `GET` | `/api/cron/nep/validation-sweep` | Smoke checks and validation handoff. |
| `GET` | `/api/cron/nep/receipt-rollup` | Daily receipt summary. |
| `GET` | `/api/cron/nep/open-gap-review` | Weekly open-gap review. |

## Supabase Tables When Approved

- `leads`
- `digital_bid_submissions`
- `floor_systems`
- `design_colors`
- `locations`
- `gallery_projects`
- `users`
- `projects`
- `appointments`
- `messages`
- `payments`
- `dashboard_events`
- `cron_runs`
- `validation_receipts`
- `approval_gates`
- `open_gaps`

## Receipt Shape

```json
{
  "id": "nep_receipt_2026_07_01_0001",
  "system": "national_epoxy_pros",
  "workflow": "nep_validation_sweep",
  "mode": "dry_run",
  "status": "planned",
  "timestamp": "2026-07-01T08:00:00.000Z",
  "actions": [],
  "blockedActions": ["github_write", "vercel_mutation", "supabase_mutation"],
  "approvalRequired": true,
  "evidence": []
}
```

## Data Rules

- First build must run without Supabase.
- Supabase writes require explicit approval.
- Server-only keys must never reach client components.
- Form submissions must validate required fields and return human-readable errors.
- Cron receipts must be safe to retry.
