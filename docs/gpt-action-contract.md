# GPT Action Contract

## Purpose
GPT agents may request branch-safe browser validation and public discovery jobs against this repository without touching production systems.

## Allowed actions
- Run `npm run validate:factory`
- Run `npm run validate:routes`
- Run `npm run validate:cron`
- Run `npm run validate:browser -- <local-url>`
- Run `npm run validate:discovery -- <public-url>`
- Produce JSON receipts in `validation-artifacts/`

## Not allowed
- Production deploys
- Supabase writes
- Vercel environment changes
- Customer messaging
- Payment, DNS, or social actions
- Secret creation or disclosure

## Receipt contract
Each validation job must emit a JSON receipt with:
- `name`
- `timestamp`
- `status`
- `branchSafe`
- `target` when applicable
- `receipts[]` with command outputs, route results, screenshot paths, or blockers

## Browser validation contract
Browser jobs must capture:
- Desktop viewport: `1440x1100`
- Mobile viewport: `390x844`
- Screenshot files in `validation-artifacts/`
- Route smoke checks before claiming success

## Scraping contract
Public-page discovery must:
- Reject localhost/private targets
- Limit extracted links
- Avoid login or authenticated flows
- Stop on unexpected redirects or errors
- Emit a receipt with the sampled links and byte count

## GPT request example
```text
Run branch-safe validation on the current branch:
1. npm run validate:factory
2. npm run validate:routes
3. npm run validate:browser -- http://127.0.0.1:3000
Return the JSON receipts and screenshot artifact paths.
```
