# MCP Receipt: Profit-First BrowserWorker Directive Installation

Receipt ID: ABOS-PROFIT-BW-DIRECTIVE-20260724
Date: 2026-07-24
Operator approval: "implement this"
Repository requested: Strategic-Minds/AUTO_BUILDER
Repository resolved by GitHub: Strategic-Minds/AUTO_BUILDER-V1
Branch: auto-builder/profit-browserworker-directive-20260724
Pull request: #93
Action class: branch-safe documentation, CI, and validation write
Production mutation: false
Secrets changed: false
Database mutation: false
Production deployment triggered: false
Preview deployment: automatically attempted by the existing Vercel Git integration

## Installed authority

- `docs/gpt/PROFIT_FIRST_BROWSERWORKER_PARITY_DIRECTIVE.md`
- `docs/gpt/MASTER_INVOCATION_PROMPT.md`
- `docs/gpt-business-account/START_EVERY_REQUEST_HERE.md`
- `docs/gpt-business-account/MANDATORY_READ_CUSTOM_INSTRUCTIONS_UNDER_1499.md`
- `docs/gpt-business-account/README.md`

## Enforcement

- Added `scripts/validate-profit-browserworker-directive.mjs`.
- Added `npm run validate:profit-browserworker`.
- Chained the validator into `npm run validate:factory`.
- Added `.github/workflows/profit-browserworker-directive.yml` so the directive validator runs independently of unrelated legacy lint or build failures.
- Validator checks canonical BrowserWorker, connector boot, 99.00% visual parity, 100% operational acceptance, five-minute cron, protected release gate, and custom-instruction length.

## Validation evidence

- AUTO_BUILDER Enterprise Validate: PASS on the initial PR head.
- Master Validate: FAILED at the repository lint step before later checks.
- Strategy Validate: FAILED at the repository lint step before later checks.
- Vercel preview build: BLOCKED by the pre-existing missing module `@/lib/internal-auth` in validation, quarantine, and workforce-supervisor routes.
- The missing internal authorization helper is already isolated in draft PR #91 and was not mixed into this directive PR.

## Rollback

Close draft PR #93 without merge or revert the installation commits after merge. No production state, Supabase data, secrets, payments, domains, customer messages, or public releases were changed.
