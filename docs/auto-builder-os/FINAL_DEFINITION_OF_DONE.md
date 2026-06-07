# AUTO BUILDER OS - Final Definition Of Done

Date: 2026-06-07
Status: Mandatory release standard

AUTO BUILDER OS is complete only when every required item in `MASTER_SYSTEM_COMPLETION_TODO.md` is either:

- completed with evidence,
- explicitly not applicable with evidence,
- or blocked by a hard external gate with owner, required action, and next test.

## Done Means

1. The uploaded frontend is ported into the canonical repo without redesign.
2. Dependency install succeeds.
3. Lint succeeds.
4. Typecheck succeeds.
5. `next build` succeeds.
6. Supabase schema is applied on a development branch.
7. Supabase RLS policies are hardened.
8. Supabase advisors are clean or documented non-blocking.
9. Engine routes smoke successfully.
10. Project routes smoke successfully.
11. Workflow routes smoke successfully.
12. Approval/gate routes smoke successfully.
13. Bridge routes smoke successfully.
14. GitHub Actions dispatch dry-run works.
15. Browser desktop screenshot smoke passes.
16. Browser mobile screenshot smoke passes.
17. No secret values render in the UI.
18. Connector dry-runs pass or produce hard-gate receipts.
19. Auto Social is draft-only and receipt-backed.
20. Vercel Workflow packet is implemented.
21. Vercel Sandbox packet is implemented.
22. Five-minute cron validator is configured as non-mutating by default.
23. Drive source truth is searched before every new idea.
24. Drive handoff docs are mirrored when Drive write bridge is available.
25. Production deploy is approval-gated.
26. Production database migration is approval-gated.
27. Live social publishing is approval-gated.
28. Commerce/payment mutations are approval-gated.
29. Customer messages are approval-gated.
30. Every completed item has evidence.

## Not Done Means

The system is not done if any of these remain true:

- frontend builds only in v0 but not canonical repo,
- schema exists but was not applied on a dev branch,
- RLS is enabled but policies are incomplete,
- browser routes exist but screenshots were not captured,
- connectors show env names but no live dry-run or hard-gate receipt exists,
- generated docs exist but no generator/Vercel workflow path is available,
- Drive was searched but not mirrored and no Drive write gate is recorded,
- protected actions can run without approval,
- any item is marked complete without a receipt.
