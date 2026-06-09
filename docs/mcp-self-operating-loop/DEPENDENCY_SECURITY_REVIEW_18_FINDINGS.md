# Dependency And Security Review - 18 Finding Intake

## Status

Started. The audit artifact with the exact 18 findings has not been verified in the repo or connected workflow output yet.

## Scope Lock

This review is part of Wave 0/1 hardening only. Keep it focused on:

- GitHub evidence and branch safety.
- Vercel deployment/runtime evidence.
- Supabase receipt persistence safety.

Do not use this review to widen provider adapters beyond GitHub, Vercel, and Supabase receipt persistence.

## Current Verified Package Surface

From `package.json` on `auto-builder/mcp-universe-build-20260608`:

- Next.js `^15.3.3`
- React `^19.1.0`
- `@supabase/supabase-js` `^2.49.8`
- `@vercel/sandbox` `^1.8.0`
- `@modelcontextprotocol/sdk` `^1.26.0`
- `mcp-handler` `^1.1.0`
- Playwright `^1.53.0`
- `workflow` `^4.0.1-beta.26`
- Zod `^3.25.76`

`package-lock.json` was not found through the connected GitHub file reader on this branch, so exact transitive dependency resolution is not yet verified.

## Finding Intake Queue

| Finding | Source | Package / Area | Severity | Status | Wave 0/1 Decision | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 02 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 03 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 04 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 05 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 06 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 07 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 08 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 09 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 10 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 11 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 12 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 13 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 14 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 15 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 16 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 17 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |
| 18 | audit artifact needed | TBD | TBD | pending evidence | hold | Attach exact advisory/CVE/package path. |

## Initial Review Notes

- The `workflow` beta dependency should remain under scrutiny because prior completion-lock notes identified workflow-runtime risk in other branches.
- Exact audit remediation cannot be claimed until the advisory IDs, affected versions, patched versions, and dependency paths are verified.
- Any dependency update must run build validation and route probes before merge readiness is claimed.

## Next Evidence Needed

1. Retrieve the dependency/security audit artifact containing the 18 findings.
2. Classify each finding by severity, exploitability, affected runtime surface, and whether it touches Wave 0/1 routes.
3. Separate direct dependency updates from transitive-only updates.
4. Avoid broad dependency churn while PR #25 is validating route and receipt persistence behavior.
5. Re-run Vercel preview route probes after any dependency patch.
