# Eden Skye Character Operating Pack

Status: installed operating module draft
Parent system: SOL Persistent Live Avatar Assistant v1
Repo target: Strategic-Minds/AUTO_BUILDER
Install branch: install-eden-skye-operating-pack

## Purpose

This folder installs the Eden Skye image-library, character-bible, social-ops, commerce, video, and repurposing system into the existing SOL / Eden Skye governed operating lane.

It does not publish, schedule, mutate Shopify, create a HeyGen Digital Twin, or spend money. It provides the repo-side operating source of truth and queue templates needed to connect the Eden Skye system to Metricool, Repurpose.io, Xyla, Shopify, Kling AI, HeyGen, and related execution surfaces.

## Installed Files

- `CHARACTER_BIBLE.md` - canonical Eden Skye identity, visual standard, voice, content pillars, offer ladder, and approval rules.
- `INSTALL_MANIFEST.json` - machine-readable install manifest for AUTO BUILDER routing.
- `SOURCE_NOTES.md` - platform source notes used to shape import and workflow assumptions.
- `csv/metricool-calendar-seed.csv` - draft scheduling seed for Metricool import adaptation.
- `csv/repurpose-workflow-map.csv` - Repurpose.io workflow plan.
- `csv/xyla-social-queue.csv` - Xyla creative handoff queue.
- `csv/kling-prompt-bank.csv` - Kling AI image-to-video prompt bank.
- `csv/heygen-script-bank.csv` - HeyGen short script bank.
- `csv/shopify-offer-asset-sheet.csv` - Shopify draft offer and asset sheet.

## Source Truth

Verified in current execution:

- AUTO BUILDER bridge health returned `ok`.
- Bridge repo map identifies `Strategic-Minds/AUTO_BUILDER` as source, `Strategic-Minds/SANDBOX` as build/test lane, and `Strategic-Minds/FRONTEND` as deployable surface.
- Existing repo already contains `docs/sol-persistent-live-avatar/` with Eden Skye / SOL governance.
- GitHub repo permissions include push access.
- Current installed package is a repo-safe text/CSV operating module; binary image assets remain outside git and should be moved through Drive, Shopify CDN, Vercel Blob, or another approved asset store.

## System Boundary

Allowed in this installed module:

- Character source of truth.
- Prompt banks.
- Social queue seeds.
- Shopify draft offer planning.
- Metricool/Repurpose/Xyla/Kling/HeyGen handoff templates.
- Approval and governance rules.

Not allowed without explicit current-session approval:

- Public posting or scheduling.
- Shopify product creation, pricing changes, or live theme/page edits.
- HeyGen Digital Twin creation or repeated cost-bearing generation.
- Paid promotion or ad spend.
- Supabase production SQL.
- Vercel production deployment.
- Secrets or credential commits.

## Recommended Runtime Route

1. Use this folder as the Eden Skye operating source inside AUTO BUILDER.
2. Copy image binaries from the separately generated image-library bundle into an approved asset store.
3. Replace placeholder media URLs in `csv/metricool-calendar-seed.csv` with public direct media URLs.
4. Generate Kling and HeyGen outputs in staging only.
5. Send approved assets into Xyla/Repurpose drafts.
6. Keep Shopify products in draft until Jeremy approves the exact live mutation.
7. Track outputs and signals in the operating ledger.

## Next Integration Targets

- Add a UI route in `FRONTEND` for reviewing Eden Skye queue status.
- Add Supabase staging tables for persona assets, prompt bank, content queue, approvals, and signal logs.
- Add capability tests for import CSV shape, approval gates, and no-secrets enforcement.
- Add optional Vercel preview workflow after the text module is approved.
