# Forbidden Fruit / Eden Skye System Install Handoff

Date: 2026-05-28  
Repo: `Strategic-Minds/AUTO_BUILDER`  
Branch: `install-eden-skye-operating-pack-clean`  
Parent lane: `docs/sol-persistent-live-avatar/`  
Parent company: Forbidden Fruit  
First persona: Persona 001 - Eden Skye

## Current Status

The Eden Skye character/image/content/commerce/video operating pack has been reframed as the first persona module inside Forbidden Fruit.

The repo-safe installation module lives under:

`docs/sol-persistent-live-avatar/eden-skye-operating-pack/`

This installs parent brand source truth, Persona 001 source truth, queue templates, platform policy blockers, and sandbox review data only. It does not perform public posting, Shopify mutations, payment activation, HeyGen Digital Twin creation, live chat/voice/video deployment, billing changes, production database mutations, or production deployment.

## Source Truth

Grounded sources used:

- Existing repo README and governance rules.
- Existing SOL / Eden Skye files in `docs/sol-persistent-live-avatar/`.
- AUTO BUILDER bridge summary and connector manifests.
- Generated Eden Skye image library and character pack from the current workspace.
- User correction that Eden Skye belongs to Forbidden Fruit, a company for AI women personas, downloadable videos, chat, voice, and fantasy-entertainment interactions.
- Metricool, Repurpose.io, HeyGen, and Kling AI public source notes captured in `eden-skye-operating-pack/SOURCE_NOTES.md`.

## System Boundary

Installed module contains:

- Forbidden Fruit parent brand brief
- platform policy validation matrix
- Eden Skye Persona 001 character bible
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
- sandbox-only schema handoff for reusable Forbidden Fruit tables
- read-only review UI and approval-gated API routes

Binary image assets remain outside git and should be hosted through Drive, Shopify CDN, Vercel Blob, or another approved public asset layer before scheduler import or downloadable-product setup.

## Repo And File Map

Key files in this module:

- `docs/sol-persistent-live-avatar/EDEN_SKYE_SYSTEM_INSTALL_HANDOFF.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/README.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/FORBIDDEN_FRUIT_PARENT_BRAND_BRIEF.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/PLATFORM_POLICY_VALIDATION_MATRIX.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/CHARACTER_BIBLE.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/INSTALL_MANIFEST.json`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/SOURCE_NOTES.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/frontend/EDEN_SKYE_QUEUE_REVIEW_PLAN.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/supabase/EDEN_SKYE_SANDBOX_SCHEMA.sql`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/supabase/README.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/metricool-calendar-seed.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/repurpose-workflow-map.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/xyla-social-queue.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/kling-prompt-bank.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/heygen-script-bank.csv`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/csv/shopify-offer-asset-sheet.csv`

## Sandbox Data Model

Reusable Forbidden Fruit tables now replace Eden-only assumptions:

- `forbidden_fruit_personas`
- `persona_assets`
- `persona_prompt_bank`
- `content_products`
- `interaction_modes`
- `approval_events`
- `signal_logs`

Eden Skye is seeded as `persona_key = 'eden-skye'` and `persona_number = 1`.

## Validation Plan

1. Confirm all files are text/CSV/JSON/Markdown only.
2. Confirm no secrets or credentials are present.
3. Confirm CSVs are UTF-8 and include headers.
4. Confirm approval gates are present for public posting, scheduling, Shopify, payment activation, HeyGen, chat/voice/video launch, billing, production deploys, and Supabase production SQL.
5. Confirm no binary images are committed to repo.
6. Confirm install module aligns with the existing SOL governance lane.
7. Confirm `/eden-skye/review` reads Forbidden Fruit sandbox tables when preview envs point at the confirmed sandbox target.
8. Confirm policy matrix blocks live commerce and distribution until validated.

## Approval-Required Actions

Jeremy approval is required before:

- public posting
- scheduling posts
- Shopify product/store mutation
- payment activation or checkout launch
- live pricing or discount changes
- HeyGen Digital Twin creation
- repeated cost-bearing video generation
- chat, voice, or video interaction launch
- paid promotion
- Vercel production deployment
- Supabase production SQL
- bulk outbound messaging

## Rollback Path

If this install needs to be removed, delete:

- `docs/sol-persistent-live-avatar/EDEN_SKYE_SYSTEM_INSTALL_HANDOFF.md`
- `docs/sol-persistent-live-avatar/eden-skye-operating-pack/`
- the Eden/Forbidden Fruit review routes and data client changes in PR #2

No production runtime, database, commerce, payment, chat, video, or publishing state is modified by this text-module install.

## Next Best Prompt

`AUTO BUILDER, confirm the PR #2 Vercel preview reads Forbidden Fruit sandbox rows through the existing Supabase env contract, then keep writes gated and test one content-product approval, one rejection, and one signal log only against the confirmed sandbox target.`
