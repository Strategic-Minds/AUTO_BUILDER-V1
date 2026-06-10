# Vercel Workflow Contract

## Purpose
Define how AUTO_BUILDER routes Strategic Minds Advisory through Vercel Workflow without directly building the website from chat.

## Execution Rail
- Control repo: Strategic-Minds/AUTO_BUILDER
- Target repo: XPS-IINTELLIGENCE-SYSTEMS/strategic-minds-advisory
- Target branch: feature/auto-builder-sync
- Environment: preview_only
- Schedule intent: every five minutes for validation and reconciliation

## Workflow Responsibilities
1. Detect approved AUTO_BUILDER packet status.
2. Confirm target branch and repo.
3. Confirm no blocked file classes changed.
4. Request or observe Vercel preview evidence.
5. Run validation agent checks.
6. Write Drive and GitHub receipts.
7. Block promotion until operator approval.

## Blocked Actions
- production deployment
- live payment processing
- live SMS sending
- customer messaging
- homepage or UI changes in sync-only flow
- secret handling in repo content

## Success Evidence
A workflow is considered submitted only when GitHub commit receipts, Vercel preview/workflow receipts, validation report, and Drive receipt are present.
