# Eden Skye PR #2 Vercel Check Report

Date: 2026-05-28  
PR: #2 `Install Eden Skye character operating pack`  
Branch: `install-eden-skye-operating-pack-clean`  
Deployment: `dpl_6Bb2Ma1MXD3njtv83bZpGSkdpnCJ`  
Vercel URL: `auto-builder-hlgr1ow59-strategic-minds-advisory.vercel.app`  
Status: `ERROR`

## Verified

- GitHub PR #2 is open and mergeable.
- Vercel attached a preview deployment to the PR branch.
- Vercel deployment state is `ERROR`.
- Build cloned `Strategic-Minds/AUTO_BUILDER` branch `install-eden-skye-operating-pack-clean` at commit `00eb3d26632ca3d43a8496ecb4d281c977d5090a`.
- Install completed successfully with `npm install`.
- Build failed during `npm run build`.

## Failure Evidence

The Vercel build error points to existing TypeScript in:

`src/lib/autobuilder/mcp-core.ts`

Relevant log summary:

- Build worker exited with code `1`.
- `npm run build` exited with `1`.
- TypeScript reported a permissions typing failure around `parseWorkflowBridgeRequest`.
- The failing expression is the `Object.fromEntries(...)` assignment to `permissions`, where the inferred value type remains `unknown` instead of `string`.

Observed code area:

```ts
permissions: Object.fromEntries(
  Object.entries(asRecord(input.permissions)).filter(([, value]) => typeof value === "string")
),
```

## Inferred Root Cause

The Eden Skye install is docs/JSON/CSV only and should not affect Next.js build output directly. The preview failure is likely caused by a pre-existing strict TypeScript type issue in the workflow bridge code that is exposed during this PR preview build.

Recommended local-safe patch:

```ts
const permissionEntries = Object.entries(asRecord(input.permissions))
  .filter((entry): entry is [string, string] => typeof entry[1] === "string");

permissions: Object.fromEntries(permissionEntries),
```

or:

```ts
permissions: Object.fromEntries(
  Object.entries(asRecord(input.permissions))
    .filter(([, value]) => typeof value === "string")
    .map(([key, value]) => [key, String(value)])
),
```

## Could Not Verify

- Whether the same build failure exists on `main`; this run inspected the PR deployment only.
- Whether Vercel project settings run extra build checks beyond `npm run build`.
- Whether there are additional hidden errors after this TypeScript issue is fixed.

## Blocker

Vercel preview cannot pass until the TypeScript permissions inference issue is patched.

## Workaround

Continue adding sandbox-only Eden Skye planning docs to PR #2 while keeping production untouched. Treat the Vercel failure as a separate preview-build self-heal item before merge readiness.

## Next Action

Patch `src/lib/autobuilder/mcp-core.ts` on the PR branch or a separate build-fix PR, rerun Vercel, then re-check preview status.
