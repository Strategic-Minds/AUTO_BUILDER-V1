# AUTO FINALIZE FRONTEND BUILDER DOCS

## Purpose
Create the operating instructions for an autonomous frontend finalizer that can complete Auto Builder without piecemeal page drift.

## Canonical repo
Strategic-Minds/AUTO_BUILDER-V1

## Locked frontend outcome
Auto Builder must become a production-grade PWA and desktop workspace for Strategic Minds AI. The UI must stay minimal, dark, blue, glassmorphic, and operational.

## Required route set
- / public homepage
- /dashboard minimal user dashboard
- /chat agent swarm chat
- /builder visual builder
- /timeline project timeline
- /project project control page
- /tools automation tools
- /templates template selector
- /accounts connected accounts
- /approvals approval gates
- /validator validation score and auto-heal
- /workflow Vercel Workflow and cron monitor
- /settings settings
- /menu mobile menu

## Builder sequence
1. Read this document and 00_FRONTEND_MASTER_PLAN.md.
2. Audit existing files under src/app and src/components.
3. Create missing shared components first.
4. Create missing routes using the shared components.
5. Add data contracts before real backend mutations.
6. Add route-level tests.
7. Add Vercel cron route for frontend finalization checks.
8. Run build and route validation.
9. Write receipts.
10. Stop at release gate.

## Component contract
Each route must use shared components where possible: MobilePwaShell, GlassCard, StatusPill, GlassButton, AgentChatPanel, VisualBuilderCanvas, TimelineRail, ApprovalGateCard, ConnectedAccountCard, TemplateCard, ToolCard, ValidatorScoreCard, BuildTimer, WorkflowStatus, MatrixLoader, PwaInstallButton.

## Autonomous finalizer rules
- Do not redesign the approved brand.
- Do not add unsupported trust logos.
- Do not add bottom nav before signup on public homepage.
- Do not expose secrets.
- Do not trigger live customer messages.
- Do not mutate production Supabase without explicit gate approval.
- Write receipts for every finalization pass.

## Acceptance criteria
The finalizer is successful only when every required route exists, every route has a smoke test target, PWA manifest exists, cron validation route exists, build passes, and release remains gated until operator approval.
