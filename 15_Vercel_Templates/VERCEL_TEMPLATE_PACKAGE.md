# Vercel Template Package

## Required templates
- nextjs-leadgen-site-template
- nextjs-local-location-site-template
- nextjs-auto-social-dashboard-template
- nextjs-client-portal-template
- nextjs-admin-control-plane-template
- nextjs-estimator-proposal-template
- nextjs-competitive-intelligence-dashboard-template
- nextjs-license-portal-template

## Required endpoints
- /api/cron/auto-builder
- /api/cron/enterprise-kernel
- /api/intelligence/ingest
- /api/intelligence/competitive
- /api/agents/message
- /api/agents/replicate
- /api/workspace/bootstrap
- /api/templates/render
- /api/quality/validate
- /api/receipts/write

## Required preview checks
- build passes
- lint passes
- route smoke passes
- cron endpoint returns dry_run receipt
- Supabase env variables detected but not exposed
- AI Gateway env variables detected but not exposed
- rollback plan exists
