# Auto Social Drive Connection

## Status

Connected on 2026-06-07.

This document records the governed Drive connection for the Auto Social lane in `Strategic-Minds/AUTO_BUILDER`.

## Verified

- Auto Builder source repo: `Strategic-Minds/AUTO_BUILDER`
- Auto Builder repo role: orchestration brain and source-truth control layer
- Current Auto Social Drive folder: `AUTO SOCIAL`
- Auto Social Drive folder ID: `1rQ7uONPfpud7YEZ4AEf2M8QfuzK-T5kI`
- Auto Social Drive folder URL: https://drive.google.com/drive/folders/1rQ7uONPfpud7YEZ4AEf2M8QfuzK-T5kI
- Folder owner visible to connector: Jeremy / `strategicmindsadvisory@gmail.com`
- Folder created: 2026-06-07T21:43:02.440Z
- Folder contained, at connection time:
  - `EDEN SKYE STUDIOS` folder
  - `AUTO_SOCIAL_OS_WORKBOOK.xlsx`

## Connected Assets

| Asset | Type | ID | URL |
| --- | --- | --- | --- |
| AUTO SOCIAL | Drive folder | `1rQ7uONPfpud7YEZ4AEf2M8QfuzK-T5kI` | https://drive.google.com/drive/folders/1rQ7uONPfpud7YEZ4AEf2M8QfuzK-T5kI |
| EDEN SKYE STUDIOS | Drive folder | `1_oW9mJgdm2OD-RWi3URRX4oVkTkOzsQK` | https://drive.google.com/drive/folders/1_oW9mJgdm2OD-RWi3URRX4oVkTkOzsQK |
| AUTO_SOCIAL_OS_WORKBOOK.xlsx | Spreadsheet | `1g9ZFWBQ7SYtVAwAkwGQs2H1191oIWXa5` | https://docs.google.com/spreadsheets/d/1g9ZFWBQ7SYtVAwAkwGQs2H1191oIWXa5/edit |

## Runtime Defaults

The following non-secret defaults are declared in `.env.example`:

```bash
AUTO_SOCIAL_DRIVE_FOLDER_ID=1rQ7uONPfpud7YEZ4AEf2M8QfuzK-T5kI
AUTO_SOCIAL_DRIVE_FOLDER_URL=https://drive.google.com/drive/folders/1rQ7uONPfpud7YEZ4AEf2M8QfuzK-T5kI
AUTO_SOCIAL_WORKBOOK_ID=1g9ZFWBQ7SYtVAwAkwGQs2H1191oIWXa5
AUTO_SOCIAL_WORKBOOK_URL=https://docs.google.com/spreadsheets/d/1g9ZFWBQ7SYtVAwAkwGQs2H1191oIWXa5/edit
AUTO_SOCIAL_EDEN_STUDIOS_FOLDER_ID=1_oW9mJgdm2OD-RWi3URRX4oVkTkOzsQK
AUTO_SOCIAL_EDEN_STUDIOS_FOLDER_URL=https://drive.google.com/drive/folders/1_oW9mJgdm2OD-RWi3URRX4oVkTkOzsQK
```

## Operating Use

Use this Drive connection for the Auto Social lane when routing:

1. Content intake.
2. Social draft generation.
3. Eden Skye studio assets.
4. Workbook-driven social operating state.
5. Media asset handoffs.
6. Approval receipts and tool receipts.
7. Weekly analytics review packets.

## Governance

This connection is a repo-side record and runtime default only.

It does not authorize:

1. Production deploys.
2. Drive permission changes.
3. Public publishing.
4. Shopify mutation.
5. Stripe/payment mutation.
6. Vercel environment mutation.
7. Supabase schema mutation.

Protected actions still require explicit Jeremy approval in the current session.

## Next Validation

Before runtime execution, Auto Builder should verify:

1. The folder is still accessible.
2. The workbook is readable and has the expected tabs.
3. `EDEN SKYE STUDIOS` contains the expected brand/media subfolders.
4. Runtime environment variables have been set in the deployment target if the app needs them outside repo defaults.
5. Social publishing remains approval-gated.
