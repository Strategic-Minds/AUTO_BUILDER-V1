---
name: ecosystem-auditor
description: |
  APEX Master Ecosystem Auditor. Analyzes ALL connected systems — Gmail, Google Drive, Supabase, GitHub repos, and Vercel projects — then compiles, categorizes, scores each asset as VALUABLE/WEAK/ARCHIVE, and migrates valuable assets into the correct new Drive structure + repo + Supabase memory + ChatGPT Business Workspace. Run this when Jeremy says "audit everything", "clean up", "migrate", or "organize the system".
---

# APEX Ecosystem Auditor

## What This Skill Does

Full 6-source audit → categorize → score → migrate pipeline.

Sources audited:
1. Gmail — threads, labels, important contacts, lead signals
2. Google Drive — all 3 Shared Drives (AUTO BUILDER OS, STRATEGIC MINDS, XPS)
3. Supabase — all tables, agent_memory entries, orphaned records
4. GitHub — all repos across Strategic-Minds org (active vs stale vs empty)
5. Vercel — all projects (READY vs ERROR vs stale)
6. ChatGPT Business Workspace — agents, conversations, knowledge files

## Scoring System

Every asset gets one of 3 ratings:

- VALUABLE (score 70-100): Keep + migrate to correct new Drive folder
- WEAK (score 30-69): Flag for Jeremy review, do not auto-migrate
- ARCHIVE (score 0-29): Move to 09_ARCHIVE, do not delete

## Migration Targets

After scoring, VALUABLE assets route to:

| Asset Type | Destination |
|---|---|
| Strategy docs | [COMPANY]/01_STRATEGY |
| SOPs, runbooks | [COMPANY]/02_OPERATIONS |
| Code, deploys | [COMPANY]/03_PROJECTS |
| Research, clones | [COMPANY]/04_INTELLIGENCE |
| Lead data | [COMPANY]/05_LEADS_CRM |
| Content, copy | [COMPANY]/06_CONTENT |
| Financial docs | [COMPANY]/07_FINANCE |
| Agent memory | [COMPANY]/08_MEMORY |
| Old/stale | [COMPANY]/09_ARCHIVE |

Companies: AUTO_BUILDER_OS (0AMcYb0pLQvwIUk9PVA) | STRATEGIC_MINDS (0AMoWCk_jzUpdUk9PVA) | XPS (0AFeSGlA9oE_iUk9PVA)

## Execution Steps

1. SCAN — Parallel scan of all 6 sources
2. COMPILE — Build unified asset inventory (name, type, source, size, last modified, content summary)
3. CATEGORIZE — Assign company tag (AUTO_BUILDER / STRATEGIC_MINDS / XPS / NEP / EWCYL / UNKNOWN)
4. SCORE — Rate each asset VALUABLE / WEAK / ARCHIVE
5. REPORT — Show Jeremy a summary table before any migration
6. APPROVAL GATE — Wait for Jeremy to say "migrate" before moving anything
7. MIGRATE — Move VALUABLE assets to correct Drive folders
8. SYNC — Write migration receipts to Supabase agent_memory + Master Manifest Sheet
9. PUSH — Commit new skill files and docs to AUTO_BUILDER GitHub repo
10. NOTIFY — Post completion summary to Slack #apex-ops

## Required Credentials

- GOOGLEDRIVE_ACCESS_TOKEN (via get_connector_token)
- GOOGLESHEETS_ACCESS_TOKEN (via get_connector_token)
- GMAIL_ACCESS_TOKEN (via get_connector_token)
- SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (from env)
- GITHUB_TOKEN (from env)
- VERCEL_TOKEN (from env)
- CODEX_API_KEY (ChatGPT Workspace agent token)

## Output Format

```
ECOSYSTEM AUDIT REPORT — [DATE]
================================
GMAIL:      [N] threads | [N] valuable | [N] weak | [N] archive
DRIVE:      [N] files   | [N] valuable | [N] weak | [N] archive
SUPABASE:   [N] records | [N] valuable | [N] weak | [N] archive
GITHUB:     [N] repos   | [N] active   | [N] stale | [N] empty
VERCEL:     [N] projects| [N] ready    | [N] error | [N] stale
CHATGPT:    [N] agents  | [N] active   | [N] stale
================================
TOP 10 VALUABLE ASSETS:  [list]
TOP 10 WEAK ASSETS:      [list]
MIGRATION PLAN:          [Drive path for each]
================================
AWAITING APPROVAL TO MIGRATE
```

## Governance

- NEVER delete anything — only move to 09_ARCHIVE
- NEVER migrate without Jeremy approval
- NEVER expose credentials in output
- ALWAYS write a receipt to Supabase before and after migration
- ALWAYS post to Slack #apex-ops when complete
