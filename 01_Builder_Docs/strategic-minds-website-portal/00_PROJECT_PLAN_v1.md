# Strategic Minds AI — Website + Client/Admin Portal System
# PROJECT PLAN v1.0 (PLAN Phase Deliverable)
**Mode:** AUTO_BUILDER 2.0 governed website-factory | **Phase:** PLAN → DISCOVERY (pre-BRAND)
**Date:** 2026-07-03 | **Author:** APEX ORCHESTRATOR | **Status:** AWAITING APPROVAL — no build has started

---

## 1. OBJECTIVE

Produce an implementation-ready plan for a premium, production-grade Strategic Minds AI
website + client portal + admin dashboard system: public marketing site (6 pages) +
protected client/admin surfaces (8 surfaces), with auth, role separation, approval-gated
project progression, a 1-free-revision-then-paid model, PWA support, light/dark mode, and
full Drive → GitHub → Vercel → scoring → repair → hardening wiring — governed by the
existing 9-phase workflow (PLAN → DISCOVERY → BRAND → APPROVAL → DOCS → BUILD → VALIDATE →
RELEASE → OPERATE). This document is the PLAN artifact. No code ships and no BRAND options
are generated until you approve this plan and I run DISCOVERY.

---

## 2. CURRENT STATE ASSUMPTIONS

Treated as given for this plan (not re-verified live in this pass — flagged in §3 where a
live check is needed before BUILD):

- Final production domain for this site is **not yet decided** (candidates seen in prior
  docs: strategicmindsai.com, strategicmindsadvisory — needs your confirmation).
- Stripe/Wix payment provider is **not yet installed** on this workspace — required before
  the Payments page can process real charges (see §10).
- Content/copy (page text, service descriptions, pricing tiers) does not exist yet — this
  is a DISCOVERY-phase deliverable, not assumed here.
- Visual direction beyond the dark-navy/white token set already captured from your
  screenshots (see `STRATEGIC_MINDS_OS_PRE_DEVELOPMENT_BLUEPRINT_v1.md` §3) is not yet
  locked — BRAND phase will produce 3 options per your standard flow, not skip to one.
- "Client" in this system = a paying Strategic Minds AI consulting client (not an XPS/epoxy
  end customer — that stays on the separate gold/black design system per existing rule).

## 3. VERIFIED VS INFERRED

**VERIFIED (checked this session, real state):**
- Repo `Strategic-Minds/strategic-minds-ai-os` exists, is **public**, branch protection is
  **active** on `main` (1 approval required, no force-push, no deletion, enforced on admins).
- Repo already has: Next.js 15 app (`src/app`), Supabase client wired
  (`@supabase/supabase-js`), Tailwind, a working sandbox testing system
  (`npm run validate:sandbox`), and a QA scoring system (`npm run sandbox:score`,
  last verified run: 94/100, SHIP IT) — this is real infrastructure to build on, not
  a fresh repo.
- Existing routes already in the repo: `/dashboard`, `/dashboard/clone`, `/auth/login`,
  `/status`, `/coming-soon`, `/sandbox/*` (testing UI), `/api/health`, `/api/clone/*`,
  `/api/sandbox/*`, `/api/cron/*`. None of the 6 public marketing pages or the 8 protected
  portal surfaces required by this project exist yet.
- Three Shared Drives exist with a stamped 9-folder template each (AUTO BUILDER OS /
  STRATEGIC MINDS / XPS) — `STRATEGIC MINDS` drive (`0AMoWCk_jzUpdUk9PVA`) is the correct
  target for this project's Drive scaffold.
- Design tokens for this specific product line (dark navy `#0A0E14` + white, NOT the
  gold/black XPS system) were already extracted from your screenshots and documented.

**INFERRED (my working assumption, needs your confirmation before BRAND/BUILD):**
- Package tiers / pricing numbers for the Pricing page.
- Whether "Documents" page needs e-signature (assumed: yes, for contracts — needs a
  provider decision, e.g. Dropbox Sign / DocuSign, not yet chosen).
- Whether Calls/Calendar page integrates Google Calendar (you already have a
  `googlecalendar` connector available) or a scheduling tool like Calendly/Cal.com.
- Number of initial admin users (assumed: just you, extendable via role model in §9).

---

## 4. PROJECT LIFECYCLE PLAN

Mapped onto the mandatory 9-phase workflow. Each phase ends in a gate — nothing advances
without your explicit approval at the gates marked 🔒.

| Phase | Output | Gate |
|---|---|---|
| **1. PLAN** | This document | 🔒 You approve this plan |
| **2. DISCOVERY** | Intake answers (services, pricing, positioning, competitors), content inventory, technical discovery (auth provider, payment provider, e-sign provider decisions) | 🔒 Discovery brief sign-off |
| **3. BRAND** | 3 brand option packs (using dark-navy tokens as the base direction) + 3 website-pack layout options, top-3 competitor benchmark brief | 🔒 You pick 1 brand pack + 1 website pack |
| **4. APPROVAL** | Locked scope doc: final page list, final portal feature list, final revision/payment terms | 🔒 Scope freeze approval |
| **5. DOCS** | Full builder doc set (§6), API contracts, entity schemas, route map (§7) finalized | 🔒 Docs review |
| **6. BUILD** | Actual implementation on a feature branch, PR-only, previews only (no production deploy) | 🔒 PR review + Vercel preview approval per milestone |
| **7. VALIDATE** | Score ≥ 90/100 via extended scoring system (§14), Playwright E2E, Lighthouse | Auto-gated — build cannot proceed to RELEASE below 90 |
| **8. RELEASE** | Merge to `main`, production Vercel deploy, domain cutover | 🔒 Explicit "go live" required (per GATEKEEPER rule — HIGH risk) |
| **9. OPERATE** | Maintenance loop, auto-heal, monthly revision-count reset, uptime monitoring | Runs continuously post-launch |

---

## 5. REQUIRED QUEUE STATES

New `project_queue_status` enum for this project (Supabase), modeled on the existing
18-status factory lifecycle but scoped to this build:

```
NEW
DISCOVERY_IN_PROGRESS
DISCOVERY_COMPLETE
BENCHMARK_IN_PROGRESS
BRAND_OPTIONS_READY
BRAND_APPROVED
SCOPE_LOCKED
DOCS_IN_PROGRESS
DOCS_APPROVED
BUILD_IN_PROGRESS
BUILD_PREVIEW_READY
QA_SCORING
QA_FAILED_AUTO_FIX
QA_PASSED
RELEASE_PENDING_APPROVAL
RELEASE_LIVE
MAINTENANCE_ACTIVE
REVISION_REQUESTED_FREE
REVISION_REQUESTED_PAID
```

Stored on the existing `Project` entity (`current_gate` field already exists in this app's
schema — will reuse it rather than duplicate) plus a new Supabase `factory_project_queue`
row for this project, consistent with the existing XPS Website Factory pattern.

---

## 6. REQUIRED BUILDER DOC SET

Must exist (as files, Drive-synced) before BUILD phase starts:

1. `01_DISCOVERY_BRIEF.md` — intake answers, business goals, target audience
2. `02_BENCHMARK_BRIEF.md` — top-3 competitor/reference analysis (per your Rule 1: scrape
   3 best-in-class examples before writing code)
3. `03_BRAND_OPTIONS.md` — 3 brand packs (colors/type/voice), dark-navy base direction
4. `04_WEBSITE_PACK_OPTIONS.md` — 3 layout/structure options for the 6 public pages
5. `05_SCOPE_FREEZE.md` — final locked feature list + page list + payment/revision terms
6. `06_ENTITY_SCHEMA_SPEC.md` — all entities this project needs (see §7/§9/§10)
7. `07_API_CONTRACT_SPEC.md` — every API route, method, request/response shape
8. `08_ROUTE_MAP.md` — this document's §7, versioned
9. `09_AUTH_ROLE_MODEL.md` — this document's §9, versioned
10. `10_VALIDATION_SCORING_PLAN.md` — this document's §14, versioned
11. `11_ROLLBACK_PLAN.md` — per-milestone rollback steps (required before any RELEASE gate)
12. `12_HANDOFF_PACKET.md` — final client-facing handoff doc (post-launch)

All 12 live in Drive under `STRATEGIC MINDS/03_PROJECTS/strategic-minds-ai-website-portal/`
and mirrored into the GitHub repo under `docs/projects/website-portal/`.

---

## 7. PAGE AND ROUTE MAP

**Public (marketing, no auth):**
| Route | Purpose |
|---|---|
| `/` | Home |
| `/about` | About |
| `/technology` | Technology |
| `/services` | Services |
| `/pricing` | Pricing |
| `/contact` | Contact |

**Protected (auth required, role-gated — see §9):**
| Route | Surface | Min. Role |
|---|---|---|
| `/portal` | Client portal home | client |
| `/portal/dashboard` | User dashboard | client |
| `/portal/journey` | Project journey/timeline | client |
| `/portal/documents` | Documents (contracts, e-sign) | client |
| `/portal/payments` | Payments page | client |
| `/portal/intake` | Intake page (new project onboarding) | client |
| `/portal/calls` | Calls/calendar page | client |
| `/admin` | Admin dashboard home | admin |
| `/admin/clients` | Client management | admin |
| `/admin/projects` | Project/queue management | admin |
| `/admin/payments` | Payment/revenue oversight | admin |
| `/admin/approvals` | Approval gate queue | admin |

**Support routes:**
| Route | Purpose |
|---|---|
| `/auth/login`, `/auth/signup`, `/auth/reset` | Auth flows |
| `/api/portal/*` | Portal-scoped API routes (RLS-enforced) |
| `/api/admin/*` | Admin-only API routes (service-role, admin-checked) |
| `/manifest.json`, `/sw.js` | PWA support |
| `/offline` | PWA offline fallback |

---

## 8. PORTAL / DASHBOARD ARCHITECTURE

**Design system for this product line** (per §3, this is the Strategic Minds OS palette —
distinct from XPS gold/black):
- Dark theme: `--background:#0A0E14` (radial glow `#1B3A5C→#0A0E14`), `--card:#131822`,
  `--primary:#FFFFFF` (pill CTAs, white-on-dark)
- Light theme: `--background:#FFFFFF`, `--card:#F8FAFC`, `--primary:#2563EB`,
  `--success:#16A34A`
- Layout: fixed left sidebar nav (Rooms/Admin/Client/Agents/Approvals pattern from your
  screenshots), 4-stat KPI row, horizontal numbered step tracker (journey), 4-column card
  grid (Recent Updates / Project Progress / Documents / Payment Schedule), theme toggle
  top-right.
- Component layer: shadcn/ui primitives + Tailwind, matching the token conventions already
  used in this app's own artifact-rendering system.

**Client portal** — scoped to `auth.uid()`'s own Project record(s) only, via Supabase RLS.
**Admin dashboard** — service-role reads across all Project/Client records, no RLS bypass
without the `admin` role claim.
**Shared shell** — both portal and admin share one Next.js layout with role-based nav
rendering, not two separate apps (keeps this inside the existing single Next.js repo rather
than spinning up a second Vercel project — cheaper, matches your $150/mo cost target).

---

## 9. AUTH / ROLE MODEL

- **Provider:** Supabase Auth (already wired — `@supabase/supabase-js` is a live dependency
  in this repo). Email/password + magic link. No new auth vendor needed.
- **Roles:** `owner` (Jeremy — full access, cannot be demoted by anyone but himself),
  `admin` (staff, full operational access, no billing-account changes), `client` (portal
  access scoped to own project only), `prospect` (intake-only, pre-signup, limited to
  `/portal/intake` until converted to `client` on deposit payment).
- **Enforcement:** role stored on a `profiles` table (1:1 with `auth.users`), checked in
  Next.js middleware for route gating AND enforced again at the Supabase RLS layer (defense
  in depth — never trust client-side role checks alone, per your API/data rules).
- **Session:** JWT via Supabase, httpOnly cookies, no tokens in localStorage.

---

## 10. PAYMENT / APPROVAL / REVISION MODEL

- **Payment provider:** NOT YET INSTALLED. This plan recommends running the payments
  installer (Wix Payments family, or Stripe if you want it explicitly, or if this ever
  touches a prohibited Wix category — it won't) at the start of BUILD phase, not now
  during PLAN. I will not fabricate API keys or pretend a provider is connected.
- **Revision model:** `Project.revision_count_used` (new field) + `Project.free_revisions`
  (default 1). Every revision request checks `revision_count_used < free_revisions` →
  if true, mark free and increment; if false, route to `/portal/payments` for a paid
  revision charge before the revision ticket opens.
- **Approval-gated progression:** every phase transition in §4 writes an
  `AgentReceipt`-style record (reusing your existing `AgentReceipt` entity) requiring
  `approved_by` + `approval_date` before `current_gate` advances — this is already the
  established pattern (`phase_1_approved` .. `phase_4_approved` fields already exist on
  the `Project` entity in this app).
- **Milestone billing:** deposit → phase-gate milestone charges → final balance, using the
  existing `Project.deposit_paid` / `amount_collected` / `balance_due` fields already in
  schema — no new entity needed for the money side, just new Payments-page UI on top of it.

---

## 11. DRIVE SCAFFOLD PLAN

Target: `STRATEGIC MINDS` Shared Drive (`0AMoWCk_jzUpdUk9PVA`) → `03_PROJECTS/` →
new folder `strategic-minds-ai-website-portal/` stamped with the standard 9-subfolder
template already used across all 3 drives:

```
01_STRATEGY | 02_OPERATIONS | 03_PROJECTS | 04_INTELLIGENCE |
05_LEADS_CRM | 06_CONTENT | 07_FINANCE | 08_MEMORY | 09_ARCHIVE
```

- `04_INTELLIGENCE/` gets the top-3 competitor benchmark brief (§6 doc 2).
- `06_CONTENT/` gets all page copy once DISCOVERY produces it.
- `08_MEMORY/` gets every builder doc from §6, mirrored from GitHub `docs/projects/`.
- Master manifest sheet (`1PpB6mKvdie-lSoxY43Cyl_WhGpAcSVOUSkFEeHjKSpg`) gets a new row
  once the folder is created — not created yet, pending your PLAN approval.

---

## 12. GITHUB REPO PLAN

**Reuse, don't fork:** build inside the existing `Strategic-Minds/strategic-minds-ai-os`
repo (already public, already branch-protected, already has the sandbox/scoring system —
building a second repo would duplicate infra for no reason).

- **Branch:** `feat/website-portal-v1` off `main` (protected — PR + 1 approval required,
  matches your Rule "Always create branches and ask for approval before merging to main").
- **New directories:**
  - `src/app/(marketing)/` — 6 public pages, shared marketing layout
  - `src/app/portal/` — 8 client portal surfaces
  - `src/app/admin/` — 4 admin surfaces
  - `src/lib/auth/` — role/session helpers
  - `src/lib/payments/` — payment provider adapter (stubbed until provider installed)
  - `docs/projects/website-portal/` — mirrors §6 doc set
  - `supabase/migrations/000X_website_portal_schema.sql` — new tables/fields
- **PR gate:** every PR must pass the existing `sandbox-validation.yml` CI (now including
  `sandbox:score`) at ≥ 90/100 before merge is even reviewable, per your PASS ALL 3 rule.

---

## 13. VERCEL WORKFLOW + CRON PLAN

- **Preview deploys:** automatic per-branch/PR (already Vercel's default for this repo).
- **Production:** stays gated — no domain cutover, no production alias change, without
  your explicit "go live" (HIGH risk item, GATEKEEPER rule).
- **New cron jobs** (added to existing `/api/cron/` pattern in this repo):
  | Cron | Schedule | Purpose |
  |---|---|---|
  | `revision-monthly-reset` | 1st of month, 00:00 UTC | Reset `revision_count_used` to 0 for active clients |
  | `approval-gate-watchdog` | every 2h | Flag any Project stuck >48h at a 🔒 gate, alert via existing Slack pattern |
  | `portal-uptime-check` | every 15min | Hit `/api/health` on the live portal once RELEASE happens |
  | `pwa-cache-warm` | daily | Pre-warm service worker cache for offline support |

---

## 14. VALIDATION + SCORING PLAN

Extends the **already-live** `scripts/sandbox/score.ts` (94/100 last real run) with new
checks specific to this project, same 4-category rubric:

- **CORRECTNESS:** all 18 routes in §7 respond 200 (or correct 401/redirect for protected
  routes when unauthenticated); revision-count logic unit-tested.
- **COMPLETENESS:** all 6 public pages + 8 protected surfaces + PWA manifest +
  light/dark toggle present; entity schema matches §9/§10 field list.
- **SAFETY:** RLS enabled on every new table; no service-role key in client bundle;
  payment webhook signature verification present once provider is installed; admin routes
  reject non-admin JWTs (tested, not assumed).
- **STANDARDS:** `tsc --noEmit` 0 errors; Lighthouse Performance ≥ 85, Accessibility ≥ 95,
  SEO ≥ 95 (per your enterprise website rules); WCAG AA contrast on both themes.

Score ≥ 90 required to leave VALIDATE phase — enforced by CI, not just self-reported.

---

## 15. REPAIR + HARDENING PLAN

- **Auto-fix loop:** reuse the existing auto-heal pattern (`apex_auto_heal_loop` automation
  already built for other projects) — on score < 90, identify every failing check, patch,
  rerun `sandbox:score`, repeat until ≥ 90 or a blocker needs you.
- **Hardening pass before RELEASE:** rate limiting on `/api/portal/*` and `/api/admin/*`,
  CSP headers, dependency audit (`npm audit`), secret scan on the feature branch before
  merge (same method used to clear `main` for public visibility).
- **Maintenance readiness (OPERATE phase):** weekly automated Lighthouse re-check,
  monthly dependency bump PR, quarterly full QA re-score.

---

## 16. REQUIRED ARTIFACTS

- 12 builder docs (§6)
- Entity schema diffs (Project field additions, new `profiles`, new
  `revision_requests` table)
- Supabase migration file
- Route map (§7) as both doc and actual file tree
- Design token file (`tailwind.config` additions for dark-navy palette)
- PWA manifest + service worker
- Rollback plan (doc 11 in §6) — mandatory before RELEASE gate per your rules
- Vercel env var checklist (payment keys, Supabase keys, Google Calendar if chosen)

---

## 17. TOP RISKS

1. **Payment provider not installed** — blocks real Payments-page functionality; must be
   resolved before BUILD reaches the payments surface, not discovered late.
2. **Content/copy doesn't exist yet** — biggest real timeline risk; DISCOVERY must produce
   real copy, not placeholder lorem ipsum, before BUILD starts on public pages.
3. **Two design systems in one org** (gold/black XPS vs dark-navy Strategic Minds) —
   must stay cleanly separated in the shared `strategic-minds-ai-os` repo so a future
   contributor doesn't cross-contaminate tokens.
4. **Role/RLS complexity** — 4 roles × 12+ protected routes is real surface area; a
   mistake here is a SAFETY-category failure, tested explicitly in §14, not assumed safe.
5. **Scope overlap with existing `/dashboard` route** already in the repo — needs a
   decision in DISCOVERY: rename/merge into `/admin`, or keep separate.
6. **E-signature and calendar provider** — not yet chosen (§2), both need your explicit
   pick before DOCS phase finalizes the API contract.

---

## 18. NEXT ACTIONS

1. 🔒 **You approve this PLAN** (this document) — nothing below starts without that.
2. Run DISCOVERY: I send you a short structured intake (services, pricing tiers, target
   client profile, e-sign/calendar provider choice, domain decision).
3. Run BENCHMARK: scrape 3 best-in-class consulting/agency portal sites for the
   Benchmark Brief (§6 doc 2).
4. Generate 3 BRAND option packs + 3 WEBSITE layout packs for your pick (§4 phase 3).
5. Once picked, lock scope (§4 phase 4) and I start DOCS (§6) in full.
6. Only after DOCS is signed off does BUILD start, on `feat/website-portal-v1`, PR-only,
   preview-only, per §12.

---

## 19. TODO

- [ ] Jeremy: approve this PLAN document
- [ ] Jeremy: confirm production domain for this site
- [ ] Jeremy: decide e-signature provider (Dropbox Sign / DocuSign / none for v1)
- [ ] Jeremy: decide calendar provider (Google Calendar connector / Calendly / Cal.com)
- [ ] Jeremy: confirm payment provider choice (Wix Payments family vs Stripe) when we
      reach BUILD — I will call `suggest_payments_installation` at that point, not before
- [ ] APEX: run DISCOVERY intake once approved
- [ ] APEX: run top-3 benchmark scrape once DISCOVERY lands
- [ ] APEX: generate BRAND + WEBSITE pack options
- [ ] APEX: write full DOCS set (§6) once scope is locked
- [ ] APEX: open `feat/website-portal-v1` branch and begin BUILD only after DOCS approval
