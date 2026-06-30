# GitHub Repo Blueprint

## Branch policy
- Work only on feature branches by default.
- Recommended branch: `feature/strategy-folder-gpt-agent-bootstrap`.
- Require PR review before main.
- No secrets in repo.
- Production deploy requires Jeremy approval receipt.

## Repo structure
```txt
AGENTS.md
.agents/skills/
app/
  api/
    control-plane/
    cron/auto-builder/
    quality/validate/
    webhooks/whatsapp/
    messages/
  page.tsx
  manifest.ts
components/
lib/
supabase/migrations/
docs/
  strategy/
  builder-docs/
  runbooks/
  receipts/
.github/workflows/
playwright.config.ts
tests/
```

## Validation workflow
- install dependencies
- lint
- typecheck
- build
- run Playwright headless Chromium
- validate no secrets
- validate RLS migration exists
- validate receipts folder exists
