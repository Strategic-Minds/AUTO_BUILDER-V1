# NPM Audit Hardening Queue

## Status

Created during AUTO BUILDER final packet execution.

## Verified

Vercel production build for commit `264d0c8f4e3b32b4517fe36c20221bd08f0652d8` completed successfully and reached `READY`.

Vercel install reported:

- 18 npm audit findings
- 9 low
- 2 moderate
- 7 high

The build still compiled successfully, generated static pages, discovered workflow directives, created the workflow manifest, and deployed to production aliases.

## Hardening Finding

The repository currently has `package.json` but no committed `package-lock.json` or `npm-shrinkwrap.json` visible through the GitHub contents API.

This means Vercel runs `npm install` without a committed lockfile, which can create dependency drift and makes audit findings harder to reproduce across environments.

## Blocker

Local hardening execution from the current agent container could not generate a lockfile because npm registry access returned:

```text
403 Forbidden - GET https://registry.npmjs.org/@modelcontextprotocol%2fsdk
```

This appears to be an execution-environment registry access restriction, not a confirmed repo code failure.

## Required Safe Hardening TODO

1. Generate `package-lock.json` in an environment with npm registry access.
2. Run `npm audit`.
3. Run `npm audit fix` only if it does not introduce breaking changes.
4. Avoid `npm audit fix --force` unless reviewed and approved.
5. Run `npm run build`.
6. Confirm Vercel deployment remains `READY`.
7. Re-run route smoke:
   - `/api/bridge/policy-check`
   - `/api/bridge/connections`
   - `/api/generator/status`
   - `/api/social/status`
   - `/api/cron/autobuilder-generator` unauthorized protection
8. Record final receipt.

## Protected Rule

Do not change major versions, remove core runtime packages, or force dependency upgrades without a successful build and smoke evidence.

## Next Safe Action

Use Vercel/GitHub Actions or another approved connected build environment with npm registry access to generate the lockfile and audit report, then submit as a separate hardening PR or guarded main commit.
