# Build Packet: Auto Social Drive Connection

## PHASE-1 / STEP-1: Connection Receipt

Date: 2026-06-07

## Objective

Connect the Auto Builder repo to the current `AUTO SOCIAL` Google Drive folder so Auto Builder can use the folder as the governed operating surface for the Auto Social lane.

## Verified Inputs

- Source repo: `Strategic-Minds/AUTO_BUILDER`
- Auto Social folder: https://drive.google.com/drive/folders/1rQ7uONPfpud7YEZ4AEf2M8QfuzK-T5kI
- Eden studio subfolder: https://drive.google.com/drive/folders/1_oW9mJgdm2OD-RWi3URRX4oVkTkOzsQK
- Auto Social workbook: https://docs.google.com/spreadsheets/d/1g9ZFWBQ7SYtVAwAkwGQs2H1191oIWXa5/edit
- Repo connection receipt: `docs/auto-social/AUTO_SOCIAL_DRIVE_CONNECTION.md`
- Runtime defaults: `.env.example`

## Verified Workbook Structure

The workbook is readable through Drive text extraction and contains these operating tabs/sections:

1. Dashboard
2. Master Workflow
3. Stack Registry
4. ENV Registry
5. Folder File Map
6. Agent Registry
7. Approval Gates
8. Validation
9. Release Log
10. Content Calendar
11. Campaign Tracker
12. Publishing Queue
13. Categories

## Scope Completed

1. Added non-secret Auto Social Drive defaults to `.env.example`.
2. Added a human-readable connection receipt under `docs/auto-social/`.
3. Verified the workbook operating structure.
4. Preserved governance boundaries: no deploy, no Drive permission mutation, no social publishing, no Shopify/Stripe mutation, no Supabase schema mutation.

## Recommended Next Build Steps

1. Define a workbook adapter contract for Dashboard, Master Workflow, Content Calendar, Campaign Tracker, Publishing Queue, Approval Gates, Validation, and Release Log.
2. Add runtime read logic that references `AUTO_SOCIAL_DRIVE_FOLDER_ID` and `AUTO_SOCIAL_WORKBOOK_ID`.
3. Add a validation route or readiness check that confirms folder, workbook, and Eden studio folder access.
4. Add queue-to-approval behavior before any Metricool, Xyla, or public publishing action.
5. Log every generated social draft, media asset, and approval request into Supabase when the Supabase lane is active.
6. Add receipt writing rules for the workbook and/or Supabase before automation expands.

## Approval Gates

Human approval is still required before:

1. Production deploy.
2. Vercel environment variable mutation.
3. Public social publishing.
4. Shopify mutation.
5. Stripe/payment mutation.
6. Supabase migration or schema change.
7. Drive permission changes.

## Validation Checklist

- [x] Current Auto Social folder located.
- [x] Folder metadata verified.
- [x] Immediate folder contents listed.
- [x] Repo source-truth inspected.
- [x] `.env.example` updated with non-secret defaults.
- [x] Connection receipt added.
- [x] Workbook tabs inspected.
- [ ] Runtime adapter implemented.
- [ ] Readiness check implemented.
- [ ] Supabase queue/receipt logging verified.
- [ ] Social publishing approval gate tested.

## BLOCKS

- Runtime deployment environment variables have not been set.
- No production validation has been run.
- The nested Eden studio subfolder structure needs a deeper folder map before media automation uses it.

## WORKAROUND

Repo-side connection defaults and receipt are now installed, and the workbook structure is verified, so future Auto Builder runs can safely continue from verified IDs and known workbook sections.

## SELF-HEAL RESULT

When bundled Auto Builder factory paths did not match live GitHub repo paths, live GitHub source-truth was used as the authority layer and the bundled Auto Builder summary was treated as discovery context only.

## NEXT GPT INSTRUCTION

Continue from this build packet. Implement a sandbox-first Auto Social Drive adapter/readiness check that reads from the configured Drive IDs, validates the workbook tabs listed above, maps the nested Eden Skye Studios folder structure, and routes generated social drafts into approval-gated queues before any publishing action.
