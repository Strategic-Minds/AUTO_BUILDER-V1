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

## Scope Completed

1. Added non-secret Auto Social Drive defaults to `.env.example`.
2. Added a human-readable connection receipt under `docs/auto-social/`.
3. Preserved governance boundaries: no deploy, no Drive permission mutation, no social publishing, no Shopify/Stripe mutation, no Supabase schema mutation.

## Recommended Next Build Steps

1. Inspect `AUTO_SOCIAL_OS_WORKBOOK.xlsx` and record worksheet/tab structure.
2. Define a workbook adapter contract for social calendar, assets, approvals, receipts, and analytics rows.
3. Add runtime read logic that references `AUTO_SOCIAL_DRIVE_FOLDER_ID` and `AUTO_SOCIAL_WORKBOOK_ID`.
4. Add a validation route or readiness check that confirms folder and workbook access.
5. Add queue-to-approval behavior before any Metricool, Xyla, or public publishing action.
6. Log every generated social draft, media asset, and approval request into Supabase when the Supabase lane is active.

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
- [ ] Workbook tabs inspected.
- [ ] Runtime adapter implemented.
- [ ] Readiness check implemented.
- [ ] Supabase queue/receipt logging verified.
- [ ] Social publishing approval gate tested.

## BLOCKS

- Workbook tab structure has not yet been inspected.
- Runtime deployment environment variables have not been set.
- No production validation has been run.

## WORKAROUND

Repo-side connection defaults and receipt are now installed, so future Auto Builder runs can safely continue from verified IDs without re-discovering the folder.

## SELF-HEAL RESULT

When bundled Auto Builder factory paths did not match live GitHub repo paths, live GitHub source-truth was used as the authority layer and the bundled Auto Builder summary was treated as discovery context only.

## NEXT GPT INSTRUCTION

Continue from this build packet. Inspect the Auto Social workbook tabs and Eden Skye Studios folder contents, then implement a sandbox-first Auto Social Drive adapter/readiness check that reads from the configured Drive IDs and routes generated social drafts into approval-gated queues before any publishing action.
