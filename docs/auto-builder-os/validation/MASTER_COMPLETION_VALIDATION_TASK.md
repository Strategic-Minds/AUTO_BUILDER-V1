# Master Completion Validation Task

Date: 2026-06-07
Status: Mandatory recurring validation task spec

## Task

Validate that `docs/auto-builder-os/MASTER_SYSTEM_COMPLETION_TODO.md` is being completed and that no unrelated build work is being performed.

## Frequency

Every five minutes in Vercel Cron once the route exists. Until the route exists, run manually from Vercel Workflow or GitHub Actions.

## Checks

- [ ] Master TODO exists.
- [ ] Start-here lock exists.
- [ ] Final definition of done exists.
- [ ] Generator packet exists.
- [ ] Vercel Workflow packet exists.
- [ ] Sandbox/cron packet exists.
- [ ] Status matrix exists.
- [ ] Evidence folders exist.
- [ ] Latest build receipt exists.
- [ ] Latest route smoke receipt exists.
- [ ] Latest browser receipt exists or hard-gate exists.
- [ ] Latest connector receipts exist or hard-gates exist.
- [ ] Protected action policy is enforced.
- [ ] No unrelated tasks are in progress.

## Output

The validation task must write a receipt with:

- current completion percentage,
- incomplete items,
- blocked items,
- next safe item,
- approval gates required,
- evidence links,
- timestamp.
