# Codex Install Prompt

PHASE: INSTALL -> VALIDATE -> HARDEN
STEP: Install highest-repo-ceiling workbook and close repo-side gaps

Use branch:
`codex/install-highest-repo-ceiling-workbook`

Do not push to main.
Do not deploy production.
Do not expose secrets.
Do not mark production-ready.

Install this workbook at:
`01_Builder_Docs/highest-repo-ceiling-one-shot/AUTO_BUILDER_HIGHEST_REPO_CEILING_ONE_SHOT_WORKBOOK.xlsx`

Install this package zip at:
`01_Builder_Docs/highest-repo-ceiling-one-shot/AUTO_BUILDER_HIGHEST_REPO_CEILING_ONE_SHOT_PACKAGE.zip`

Use the workbook as the command ledger.

Inspect workbook sheets:
- 00_START_HERE
- 05_GAP_MASTER_LEDGER
- 18_RECEIPTS_PROOF_INDEX
- 22_RECURSIVE_AUDIT_LOG
- 23_SCORECARD
- 24_CODEX_INSTALL_HANDOFF
- 25_BASE44_AGENT_HANDOFF
- 26_SECOND_GPT_AUDIT_PROMPT
- 27_FINAL_OPERATOR_HANDOFF

Inspect repo source truth:
- README.md
- START_HERE.md
- SYSTEM_INDEX.json
- WORKBOOK_OS_MANIFEST.json
- CODEX_HANDOFF.md
- CODEX_HANDOFF_RULES.md
- CHATGPT_REHYDRATE.md
- AUTO_BUILDER_PLAN.md
- DISCOVERY_REPORT.md
- VALIDATION_PLAN.md
- ENV_CHECKLIST.md
- BLOCKERS.md
- ROLLBACK_PLAN.md
- RELEASE_GATE.md
- REPO_RECEIPT_LOG.md
- package.json
- vercel.json
- .github/workflows/*
- supabase/schema.sql
- app/*
- pages/*
- components/*
- lib/*
- scripts/*
- tests/*

Mission:
Fix every repo-side P0/P1 gap in the workbook that is missing, partially_complete, or unverified.

Do not fake external blockers. Mark env/live/auth/RLS/operator approval blockers as externally_blocked_with_proof.

Required validation:
```bash
python 01_Builder_Docs/highest-repo-ceiling-one-shot/scripts/highest_repo_ceiling_workbook_validator.py 01_Builder_Docs/highest-repo-ceiling-one-shot/AUTO_BUILDER_HIGHEST_REPO_CEILING_ONE_SHOT_WORKBOOK.xlsx
python scripts/workbook_validation/validate_manifest.py # if present
python scripts/workbook_validation/validate_workbook_uploads.py # if present
python scripts/workbook_validation/validate_connector_sheets.py # if present
python scripts/workbook_validation/validate_workbook_schema.py # if present
python scripts/workbook_validation/scan_workbook_for_public_safety.py # if present
npm ci # if package-lock.json exists
npm install # if package.json exists and no lockfile exists
npx tsc --noEmit # if TypeScript exists
npm run build # if available
npm run test # if available
npm run test:smoke # if available
```

Create receipts:
- `03_Bridge_Receipts/build/RECEIPT_HIGHEST_REPO_CEILING_WORKBOOK_INSTALL.md`
- `03_Bridge_Receipts/validation/RECEIPT_HIGHEST_REPO_CEILING_VALIDATION.md`
- `03_Bridge_Receipts/rollback/ROLLBACK_HIGHEST_REPO_CEILING_INSTALL.md`

Final output must include VERIFIED, INFERRED, COULD NOT VERIFY, BLOCKERS, WORKAROUNDS, NEXT ACTIONS.
