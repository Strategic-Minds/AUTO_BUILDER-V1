# Drive Scaffold Env Redeploy Evidence

Date: 2026-06-09

Purpose: trigger a new preview deployment on `auto-builder/mcp-universe-build-20260608` after upgrading Drive folder creation auth fallbacks.

Scope:

- Re-test `drive_create_folder` against AUTO WORKFLOW only.
- Parent folder: `13VaSbBlwHGAV_8E48a-dpZD25iwQbWTM`.
- First folder: `00_COMMAND_CENTER`.

Upgrade summary:

- `GOOGLE_PRIVATE_KEY` can now contain only the PEM key, escaped-newline PEM, base64 PEM, full service-account JSON, or base64 service-account JSON.
- Alternate service-account env names are supported: `GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_CREDENTIALS_JSON`, `GOOGLE_APPLICATION_CREDENTIALS_JSON`, `GOOGLE_PRIVATE_KEY_JSON`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
- Direct token fallback is supported through `GOOGLE_DRIVE_ACCESS_TOKEN`, `GOOGLE_WORKSPACE_ACCESS_TOKEN`, or `GOOGLE_OAUTH_ACCESS_TOKEN`.
- Webhook fallback is supported through `GOOGLE_DRIVE_FOLDER_CREATE_WEBHOOK_URL` or `DRIVE_FOLDER_CREATE_WEBHOOK_URL`, with optional `GOOGLE_DRIVE_WEBHOOK_SECRET`.

Governance:

- No Supabase schema change.
- No cron activation.
- No workflow activation.
- No broad adapter widening.
- Continue scaffold only after the first live Drive create succeeds.
