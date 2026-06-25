# BASE44 APPROVAL GATES
## Version: 1.0 | Effective: 2026-06-25

## PURPOSE
Define the exact checkpoints where Base44 agent stops and waits for Jeremy's explicit approval before proceeding.

## GATE 1 — STRATEGY APPROVAL
Triggered: Before any new build begins.
Agent presents:
- Problem statement
- Economic case (revenue impact)
- Top 3 competitor benchmarks
- Proposed architecture
- Cost estimate
Jeremy approves: specific approach + budget.

## GATE 2 — DESIGN APPROVAL
Triggered: Before writing production code.
Agent presents:
- Figma-level wireframe or screenshot mockups
- Color palette + typography choices
- Section layout (above fold, trust bar, CTAs)
- Mobile layout
Jeremy approves: design direction.

## GATE 3 — SANDBOX APPROVAL
Triggered: After sandbox build complete.
Agent presents:
- Preview URL
- Validation report (all 3 passes)
- Playwright test results (every page/button/form)
- Performance scores
- Known issues or blockers
Jeremy approves: go/no-go for production.

## GATE 4 — PRODUCTION RELEASE
Triggered: After Jeremy approves Gate 3.
Agent confirms:
- All env vars set in Vercel
- GitHub main branch updated
- Supabase records created
- Drive folders updated
Jeremy approves: push to production.

## GATE 5 — POST-LAUNCH REVIEW (24hrs)
Triggered: 24 hours after production deploy.
Agent presents:
- Live PageSpeed scores
- Any errors in logs
- Conversion events (if tracking live)
- Uptime status
Jeremy approves: close project or initiate fixes.

