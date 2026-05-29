# Forbidden Fruit Platform Policy Validation Matrix

Status: pre-launch validation matrix
Parent company: Forbidden Fruit
First persona: Persona 001 - Eden Skye
Production mutation: not authorized

## Purpose

Forbidden Fruit combines adult AI fantasy personas, downloadable media, chat, voice, video, storefront offers, and public distribution. That stack has higher platform risk than a normal creator-commerce project. This matrix must be completed before live commerce, public distribution, paid promotion, or interactive chat/voice/video access.

This document is a blocker map, not a legal opinion.

## Global Launch Requirements

No live commerce or distribution until the following are verified:

- Adult-only access model and age-gate requirements.
- Clear AI/fictional persona disclosure.
- Payment processor acceptance of the exact content and interaction model.
- Storefront policy compatibility for adult AI fantasy downloads.
- Hosting/storage policy compatibility for media and interaction logs.
- Moderation rules for chat, voice, and video interactions.
- Privacy handling for user messages, fantasy preferences, purchase history, and analytics.
- DMCA/IP/likeness controls for all generated assets.
- Approval, rollback, refund, and escalation paths.

## Policy Matrix

| Platform | Intended use | Current status | Key risk | Required validation before live use | Default gate |
| --- | --- | --- | --- | --- | --- |
| Shopify | Storefront, persona profiles, digital downloads, draft products | Draft planning only | Adult/digital-content and payment eligibility can vary by region, payment method, and app stack | Verify Shopify acceptable-use rules, digital goods setup, adult-content restrictions, app compatibility, refund policy, and checkout/payment path | Block live product publishing and checkout until verified |
| Payment processor | Checkout, subscriptions, memberships, digital downloads | Not selected/verified | Adult content, AI companion, recurring billing, chargebacks, prohibited business categories | Confirm exact processor allows adult AI fantasy entertainment, downloadable media, subscriptions, and chat/voice/video access | Block payment activation until written/official policy fit is confirmed |
| HeyGen | Avatar-led persona clips and scripted video | Prompt/script planning only | Digital twin, consent, adult content limits, cost-bearing generation, platform terms | Verify synthetic-persona usage, adult content limits, voice/avatar rights, consent requirements, and commercial usage terms | Block Digital Twin creation and repeated generation until approved |
| Kling AI | Image-to-video cinematic loops and teaser media | Prompt planning only | Adult/suggestive content boundaries, identity drift, rights, watermark/commercial terms | Verify acceptable content policy, commercial rights, source-image rights, and moderation boundaries | Block public use until generated clips pass review |
| Metricool | Calendar planning and public scheduling | CSV seed only | Public posting of adult-oriented content, platform account risk, broken media URLs | Verify supported networks, adult-content rules by destination, media URL requirements, and review workflow | Block scheduling until content and asset approval pass |
| Repurpose.io | Route approved video across channels | Workflow map only | Automatic reposting can spread noncompliant content quickly | Verify destination platform compatibility, content rating, account permissions, and kill-switch behavior | Block automated distribution until review gates pass |
| Xyla | Social creative/publishing engine | Queue planning only | Public publishing and platform-policy mismatch | Verify Xyla content policy, destination platform rules, approval workflow, and rollback/remove workflow | Block live publishing until approved |
| Hosting | App deployment, landing pages, review UI, API routes | Vercel preview used for PR validation | Adult content, interactive service terms, privacy, logs, abuse handling | Verify host acceptable-use policy for adult AI fantasy storefront and interaction surfaces | Keep preview-only until host policy fit confirmed |
| Analytics | Funnel, content, conversion, retention, and signal logs | Sandbox signal schema only | Sensitive user behavior and fantasy preference tracking | Verify privacy policy, consent banners, retention limits, PII handling, and event taxonomy | Block live tracking until privacy rules exist |
| Storage | Persona assets, downloadable media, generated clips, logs | Asset host not selected | Adult media storage terms, public URL leakage, access controls, retention | Verify storage provider terms, signed/private download strategy, CDN rules, takedown process, and backups | Block public media URLs until storage target is approved |

## Required Approval Evidence

Each platform must have an approval record with:

- platform name
- policy URL or official source reviewed
- allowed use summary
- restricted use summary
- decision: approved, approved with limits, blocked, or needs counsel/operator review
- reviewer name
- review date
- rollback or kill-switch path

## Minimum Product Safety Checklist

Before any Forbidden Fruit product goes live:

- Persona is fictional and adult.
- AI disclosure appears on profile and checkout path.
- Product copy does not imply real-person access.
- Content rating is assigned.
- Refund and support language exists.
- Payment provider allows the offer.
- Download access is controlled.
- User privacy policy covers purchase and interaction data.
- Operator approval event is recorded.

## Minimum Interaction Safety Checklist

Before any chat, voice, or video interaction goes live:

- Age-gate is active.
- AI disclosure is unavoidable.
- Moderation policy exists.
- Blocked-topic list exists.
- Logs have retention limits and privacy controls.
- User consent language is present.
- Cost and rate limits are set.
- Escalation and shutdown paths exist.

## Current Blocking Decision

Forbidden Fruit may proceed with sandbox docs, schema, review UI, prompt banks, static previews, and internal queue review.

Forbidden Fruit may not proceed with live commerce, payment activation, public scheduling, automated distribution, live chat, voice access, video access, or production publishing until this matrix is validated and approval events are recorded.
