# Highest Repo Ceiling One-Shot Workbook Install

PHASE: INSTALL -> VALIDATE -> HARDEN
STEP: Branch-safe workbook/package install scaffold

## Target
- Repo alias requested: `Strategic-Minds/AUTO_BUILDER`
- Resolved GitHub repo object: `Strategic-Minds/AUTO_BUILDER-V1`
- Branch: `codex/install-highest-repo-ceiling-workbook`
- Expected workbook path: `01_Builder_Docs/highest-repo-ceiling-one-shot/AUTO_BUILDER_HIGHEST_REPO_CEILING_ONE_SHOT_WORKBOOK.xlsx`
- Expected package path: `01_Builder_Docs/highest-repo-ceiling-one-shot/AUTO_BUILDER_HIGHEST_REPO_CEILING_ONE_SHOT_PACKAGE.zip`

## Binary status
The active GitHub connector available in this ChatGPT run supports UTF-8 text file creation/update only. It does not expose a binary upload action for `.xlsx` or `.zip` contents. Therefore this branch contains the repo-side install scaffold, receipts, validator handoff, and manifest registration with binary upload marked pending.

Do not treat the workbook binary or package zip as installed until a Git/Codex/local CLI run commits the actual files.

## Required binary files to add via Codex or Git CLI
1. `AUTO_BUILDER_HIGHEST_REPO_CEILING_ONE_SHOT_WORKBOOK.xlsx`
2. `AUTO_BUILDER_HIGHEST_REPO_CEILING_ONE_SHOT_PACKAGE.zip`

## Validation summary from uploaded package audit
- Package present in uploaded-file audit: true
- Expected install path present in package audit: true
- Workbook present in package audit: true
- Required sheets: 29/29
- Missing sheets: none
- Forbidden visual/design parity sheets: none
- Production-ready false claim: false
- Production lock found: true

## Forbidden visual/design scope
This package is intentionally clean:
- No visual parity sheet
- No visual drift sheet
- No screenshot comparison rules
- No website design parity rules

Phrase hits for visual/design language in the audit are exclusion statements, not active visual parity requirements.

## Required follow-up command after binary upload
```bash
python 01_Builder_Docs/highest-repo-ceiling-one-shot/scripts/highest_repo_ceiling_workbook_validator.py \
  01_Builder_Docs/highest-repo-ceiling-one-shot/AUTO_BUILDER_HIGHEST_REPO_CEILING_ONE_SHOT_WORKBOOK.xlsx
```

## Production lock
Do not push to main. Do not deploy production. Do not expose secrets. Do not mark production-ready.
