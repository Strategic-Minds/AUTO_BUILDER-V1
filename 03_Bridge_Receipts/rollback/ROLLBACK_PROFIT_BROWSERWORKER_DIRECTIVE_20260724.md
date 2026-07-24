# Rollback: Profit-First BrowserWorker Directive

Scope: branch `auto-builder/profit-browserworker-directive-20260724`

Before merge, rollback is closing the draft pull request and deleting the branch.

After merge, revert the directive installation commit. This restores the prior prompt files, package script, and validator state.

No Supabase migration, Vercel deployment, secret change, payment action, domain action, customer message, or production mutation is included in this change.
