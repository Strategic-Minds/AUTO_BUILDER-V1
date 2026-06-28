# Connector and Account Matrix Template

| Surface | Purpose | Account Owner | Read | Write | Environment | Status | Notes |
|---|---|---|---|---|---|---|---|
| GitHub | source control | | yes/no | yes/no | dev/preview/prod | | |
| Vercel | frontend hosting | | yes/no | yes/no | dev/preview/prod | | |
| Supabase | database/auth/storage | | yes/no | yes/no | dev/preview/prod | | |
| Redis | queue/cache/locks | | yes/no | yes/no | dev/preview/prod | | |
| Google Drive | files/docs | | yes/no | yes/no | shared/admin | | |
| Gmail | summaries/alerts | | yes/no | yes/no | prod | | |
| Google Calendar | schedules | | yes/no | yes/no | prod | | |
| Airtable | staging mirror | | yes/no | yes/no | prod | | |
| HubSpot | final CRM | | yes/no | yes/no | prod | | |

## Critical notes
- Distinguish verified live access from intended future access.
- Record exact account names and email ownership.
- Record the fallback path for each write surface.
