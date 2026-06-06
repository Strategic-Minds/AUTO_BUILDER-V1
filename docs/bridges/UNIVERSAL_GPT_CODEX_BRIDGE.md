# Universal GPT to Codex / Connector Bridge

## Current status
- Installed on sandbox branch only.
- Adds an authenticated universal bridge route at `/api/bridge/universal`.
- Adds secret-name inventory without secret-value exposure.
- Adds Codex read/write/execute actions bounded by `BRIDGE_WORKSPACE_ROOT`.
- Declares max connector capability coverage for Git, Vercel, Supabase, Drive, Shopify, Codex, HeyGen, and Metricool.

## Source truth
- GPT is the orchestration brain.
- Codex and connector workers are execution layers.
- Secret values must not be returned to GPT.
- Live external mutations remain approval-gated until smoke tests prove the route and receipts.

## System boundary
- This bridge is not session-bound. Any authorized GPT/client with the universal bridge token can call it.
- It is not a permission bypass. It requires `AUTO_BUILDER_UNIVERSAL_BRIDGE_ENABLED=true`, a valid token, and `approved: true` for mutation actions.
- File and command operations are constrained to `BRIDGE_WORKSPACE_ROOT`.

## Required environment variables
- `AUTO_BUILDER_UNIVERSAL_BRIDGE_ENABLED=true`
- `AUTO_BUILDER_UNIVERSAL_BRIDGE_TOKEN=<strong secret>`
- `BRIDGE_WORKSPACE_ROOT=<exact machine folder Codex may control>`

Optional:
- `CODEX_WORKSPACE_ROOT` fallback when `BRIDGE_WORKSPACE_ROOT` is absent.
- Existing connector secrets for GitHub, Vercel, Supabase, Google Drive, Shopify, HeyGen, and Metricool.

## Smoke tests
Use POST `/api/bridge/universal` with the universal bridge token.

### Secret names, no values
```json
{
  "action": "secrets.listNames",
  "token": "<token>"
}
```

### Read
```json
{
  "action": "codex.readFile",
  "token": "<token>",
  "payload": { "relativePath": "package.json" }
}
```

### Write
```json
{
  "action": "codex.writeFile",
  "token": "<token>",
  "approved": true,
  "payload": {
    "relativePath": "tmp/bridge-smoke.txt",
    "content": "bridge smoke ok"
  }
}
```

### Execute
```json
{
  "action": "codex.execute",
  "token": "<token>",
  "approved": true,
  "payload": {
    "command": "node -v",
    "cwd": "."
  }
}
```

## Permission expansion plan
1. Validate secret-name inventory.
2. Validate Codex read inside the exact machine folder.
3. Validate approved write inside the exact machine folder.
4. Validate approved execute inside the exact machine folder.
5. Validate Git status and non-destructive Git command.
6. Validate connector-specific dry-runs.
7. Only then widen to create/move/edit/delete for Drive, Shopify media, Supabase, Vercel, HeyGen, Metricool, and production systems.
