# Environment and Secrets Template

## Environments
- development
- preview
- production

## Required variables
| Variable | Purpose | Required In | Owner | Secret | Notes |
|---|---|---|---|---|---|
| APP_ENV | environment label | all | | no | |
| FRONTEND_URL | public app URL | all | | no | |
| DATABASE_URL | primary database | preview/prod | | yes | |
| REDIS_URL | queue/cache | preview/prod | | yes | |
| SUPABASE_URL | backend | all | | no | |
| SUPABASE_ANON_KEY | public client key | all | | no | |
| SUPABASE_SERVICE_ROLE_KEY | server write path | prod | | yes | |
| HUBSPOT_TOKEN | CRM integration | prod | | yes | |
| AIRTABLE_TOKEN | staging mirror | prod | | yes | |
| GOOGLE_CLIENT_ID | workspace app | all | | yes/no | |
| GOOGLE_CLIENT_SECRET | workspace app | prod | | yes | |
| SMTP_OR_GMAIL_PATH | alerting | prod | | yes | |

## Secrets rules
- never hardcode secrets in prompts or docs
- distinguish public vars from server-only secrets
- document rotation owner
- document revocation path
