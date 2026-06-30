# Final Review Checklist

Before Jeremy approves live activation, verify:

- [ ] Drive folder scaffold exists and contains all required docs/forms/sheets.
- [ ] GPT agent instructions are installed in GPT Builder.
- [ ] GPT knowledge files are uploaded.
- [ ] GPT Actions schema points to the live Vercel control-plane preview URL.
- [ ] Supabase staging migration reviewed and RLS enabled.
- [ ] GitHub branch exists and no secrets are committed.
- [ ] Vercel preview deploy is healthy.
- [ ] Vercel cron heartbeat is configured at 5 minutes.
- [ ] AI Gateway env vars are configured in Vercel, not in repo.
- [ ] WhatsApp sender/template status verified before messaging.
- [ ] Slack and Buffer are in draft/sandbox mode before live publishing.
- [ ] Stripe/deposit flow is test mode before live payments.
- [ ] Playwright desktop/mobile/PWA tests pass.
- [ ] Humanistic headless test pass is recorded.
- [ ] Auto-heal max iterations and protected-action stops are configured.
- [ ] Client final handoff email is draft-only until approved.
