# Forbidden Fruit Persona Operating Pack

Status: installed operating module draft
Parent company: Forbidden Fruit
Persona: Persona 001 - Eden Skye
Parent system: SOL Persistent Live Avatar Assistant v1
Repo target: Strategic-Minds/AUTO_BUILDER
Install branch: install-eden-skye-operating-pack-clean

## Purpose

This folder installs the first Forbidden Fruit persona operating module. Eden Skye is no longer treated as the whole system; she is Persona 001 inside a governed adult AI fantasy-entertainment company architecture.

Forbidden Fruit is the parent brand, storefront, persona portfolio, safety policy, and monetization layer. Eden Skye is the first flagship persona with her own image library, character bible, prompt bank, content products, interaction modes, and review queue.

This module does not publish, schedule, mutate Shopify, create a HeyGen Digital Twin, run chat/voice/video services, or spend money. It provides repo-side operating source truth and queue templates needed to connect the Forbidden Fruit / Eden Skye system to Metricool, Repurpose.io, Xyla, Shopify, Kling AI, HeyGen, and related execution surfaces after policy validation and approval.

## Installed Files

- `FORBIDDEN_FRUIT_PARENT_BRAND_BRIEF.md` - parent-company strategy, user experience, storefront model, persona portfolio, content types, interaction modes, and safety boundaries.
- `PLATFORM_POLICY_VALIDATION_MATRIX.md` - pre-launch policy matrix for Shopify, payment processor, HeyGen, Kling AI, Metricool, Repurpose.io, Xyla, hosting, analytics, and storage.
- `CHARACTER_BIBLE.md` - canonical Eden Skye identity as Forbidden Fruit Persona 001.
- `INSTALL_MANIFEST.json` - machine-readable install manifest for AUTO BUILDER routing.
- `SOURCE_NOTES.md` - platform source notes used to shape import and workflow assumptions.
- `csv/metricool-calendar-seed.csv` - draft scheduling seed for Metricool import adaptation.
- `csv/repurpose-workflow-map.csv` - Repurpose.io workflow plan.
- `csv/xyla-social-queue.csv` - Xyla creative handoff queue.
- `csv/kling-prompt-bank.csv` - Kling AI image-to-video prompt bank.
- `csv/heygen-script-bank.csv` - HeyGen script bank.
- `csv/shopify-offer-asset-sheet.csv` - Shopify draft offer and asset sheet.
- `frontend/EDEN_SKYE_QUEUE_REVIEW_PLAN.md` - review route plan for Forbidden Fruit Persona 001.
- `supabase/EDEN_SKYE_SANDBOX_SCHEMA.sql` - sandbox-only Forbidden Fruit schema handoff.

## Source Truth

Verified in current execution:

- AUTO BUILDER bridge health returned `ok`.
- Bridge repo map identifies `Strategic-Minds/AUTO_BUILDER` as source, `Strategic-Minds/SANDBOX` as build/test lane, and `Strategic-Minds/FRONTEND` as deployable surface.
- Existing repo already contains `docs/sol-persistent-live-avatar/` with Eden Skye / SOL governance.
- GitHub repo permissions include push access.
- Current installed package is a repo-safe text/CSV operating module; binary image assets remain outside git and should be moved through Drive, Shopify CDN, Vercel Blob, or another approved asset store.
- User corrected the business architecture: Eden Skye belongs inside Forbidden Fruit, a parent company for AI women personas, fantasy downloads, chat, voice, and video experiences.

## System Boundary

Allowed in this installed module:

- Parent Forbidden Fruit brand source of truth.
- Eden Skye Persona 001 source of truth.
- Persona portfolio and interaction-mode planning.
- Prompt banks.
- Social queue seeds.
- Shopify draft offer planning.
- Metricool/Repurpose/Xyla/Kling/HeyGen handoff templates.
- Platform policy validation matrix.
- Approval and governance rules.

Not allowed without explicit current-session approval:

- Public posting or scheduling.
- Adult-commerce launch, payment activation, or live checkout.
- Shopify product creation, pricing changes, or live theme/page edits.
- HeyGen Digital Twin creation or repeated cost-bearing generation.
- Live chat, voice, or video interaction deployment.
- Paid promotion or ad spend.
- Supabase production SQL.
- Vercel production deployment.
- Secrets or credential commits.

## Recommended Runtime Route

1. Use Forbidden Fruit as the parent operating source and Eden Skye as Persona 001.
2. Copy image binaries from the separately generated image-library bundle into an approved asset store.
3. Replace placeholder media URLs in `csv/metricool-calendar-seed.csv` with public direct media URLs only after platform policy validation.
4. Generate Kling and HeyGen outputs in staging only.
5. Send approved assets into Xyla/Repurpose drafts.
6. Keep Shopify products in draft until Jeremy approves the exact live mutation.
7. Treat chat, voice, and video interactions as adult fantasy entertainment with clear AI disclosure, age-gating, and consent boundaries.
8. Track outputs and signals in the operating ledger.

## Next Integration Targets

- Update the review UI labels from Eden-only to Forbidden Fruit / Persona 001.
- Apply the reusable Forbidden Fruit sandbox schema only to the confirmed sandbox target.
- Validate platform policy before live commerce, payment processing, public distribution, or adult interaction deployment.
- Add capability tests for import CSV shape, approval gates, no-secrets enforcement, and AI/persona disclosure.
