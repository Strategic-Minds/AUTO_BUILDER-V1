# Eden Skye System Install Handoff

Date: 2026-05-28  
Repo: `Strategic-Minds/AUTO_BUILDER`  
Branch: `install-eden-skye-operating-pack`  
Parent lane: `docs/sol-persistent-live-avatar/`  

## Current Status

The Eden Skye character/image/content/commerce/video operating pack has been prepared as a repo-safe installation module under:

`docs/sol-persistent-live-avatar/eden-skye-operating-pack/`

This installs operating source truth and queue templates only. It does not perform public posting, Shopify mutations, HeyGen Digital Twin creation, billing changes, database mutations, or production deployment.

## Source Truth

Grounded sources used:

- Existing repo README and governance rules.
- Existing SOL / Eden Skye files in `docs/sol-persistent-live-avatar/`.
- AUTO BUILDER bridge summary and connector manifests.
- Generated Eden Skye image library and character pack from the current workspace.
- Metricool, Repurpose.io, HeyGen, and Kling AI public source notes captured in `eden-skye-operating-pack/SOURCE_NOTES.md`.

## System Boundary

Installed module contains:

- character bible
- visual standard
- content pillars
- platform operating map
- approval rules
- Metricool seed calendar CSV
- Repurpose.io workflow CSV
- Xyla queue CSV
- Kling prompt bank CSV
- HeyGen script bank CSV
- Shopify draft offer asset CSV
- install manifest

Binary image assets remain outside git and should be hosted through Drive, Shopify CDN, Vercel Blob, or another approved public asset layer before scheduler import.

## Repo And File Map

Files to add:

- `docs/sol-persistent-live-avatar/EDEN_SKYE_SYSTEM_INSTALL_HANDOFF.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/README.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/CHARACTER_BIBLE.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/INSTALL_MANIFEST.json`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/SOURCE_NOTES.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/metricool-calendar-seed.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/repurpose-workflow-map.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/xyla-social-queue.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/kling-prompt-bank.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/heygen-script-bank.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/shopify-offer-asset-sheet.csv`

## Validation Plan

1. Confirm all files are text/CSV/JSON/Markdown only.
2. Confirm no secrets or credentials are present.
3. Confirm CSVs are UTF-8 and include headers.
4. Confirm approval gates are present for public posting, scheduling, Shopify, HeyGen, billing, production deploys, and Supabase production SQL.
5. Confirm no binary images are committed to repo.
6. Confirm install module aligns with the existing SOL governance lane.

## Approval-Required Actions

Jeremy approval is required before:

- public posting
- scheduling posts
- Shopify product/store mutation
- live pricing or discount changes
- HeyGen Digital Twin creation
- repeated cost-bearing video generation
- paid promotion
- Vercel production deployment
- Supabase production SQL
- bulk outbound messaging

## Rollback Path

If this install needs to be removed, delete:

- `docs/sol-persistent-live-avatar/EDEN_SKYE_SYSTEM_INSTALL_HANDOFF.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/`

No production runtime, database, commerce, or publishing state is modified by this text-module install.

## Next Best Prompt

`AUTO BUILDER, connect to the Eden Skye operating pack in docs/sol-persistent-live-avatar/eden-skye-operating-pack, create a sandbox Supabase schema and FRONTEND review route plan for persona assets, prompt bank, content queue, approvals, and signal logs. Do not mutate production. Produce the validation and approval gate report first.`
