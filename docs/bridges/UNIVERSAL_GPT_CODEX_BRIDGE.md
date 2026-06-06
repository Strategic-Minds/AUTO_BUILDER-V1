# Universal GPT to Codex / Connector Bridge

## Current status
- Installed on sandbox branch only.
- Adds authenticated routes:
  - `/api/bridge/universal`
  - `/api/bridge/post`
  - `/api/bridge/phone`
- Adds secret-name inventory without secret-value exposure.
- Adds Codex read/write/execute actions bounded by `BRIDGE_WORKSPACE_ROOT`.
- Adds a server-side POST relay so bridge operations can run from a POST-capable deployed runtime.
- Adds a phone-control dispatcher so a phone client can trigger approved universal or POST relay actions without exposing the internal universal/post tokens to the phone client.
- Declares max connector capability coverage for Git, Vercel, Supabase, Drive, Shopify, Codex, HeyGen, and Metricool.

## Source truth
- GPT is the orchestration brain.
- Codex and connector workers are execution layers.
- Secret values must not be returned to GPT.
- Live external mutations remain approval-gated until smoke tests prove the route and receipts.
- GPT account or browser-account operations must use user-authorized sessions only and remain approval-gated.

## System boundary
- This bridge is not session-bound. Any authorized GPT/client with the correct token can call it.
- It is not a permission bypass. Mutating actions require the correct enable flag, token, and `approved: true`.
- File and command operations are constrained to `BRIDGE_WORKSPACE_ROOT`.
- POST relay targets are constrained by `POST_RELAY_ALLOWED_HOSTS` unless explicit allow-all mode is enabled.

## Required environment variables
Universal bridge:
- `AUTO_BUILDER_UNIVERSAL_BRIDGE_ENABLED=true`
- `AUTO_BUILDER_UNIVERSAL_BRIDGE_TOKEN=<strong secret>`
- `BRIDGE_WORKSPACE_ROOT=<exact machine folder Codex may control>`

POST relay:
- `AUTO_BUILDER_POST_RELAY_ENABLED=true`
- `AUTO_BUILDER_POST_RELAY_TOKEN=<strong secret>`
- `POST_RELAY_ALLOWED_HOSTS=<comma-separated allowed hostnames>`

Phone bridge:
- `AUTO_BUILDER_PHONE_BRIDGE_ENABLED=true`
- `AUTO_BUILDER_PHONE_BRIDGE_TOKEN=<strong phone client secret>`

Optional:
- `CODEX_WORKSPACE_ROOT` fallback when `BRIDGE_WORKSPACE_ROOT` is absent.
- `POST_RELAY_ALLOWED_METHODS=POST,PUT,PATCH,DELETE,GET`
- `POST_RELAY_ALLOW_ALL_HOSTS=true` for controlled sandbox testing only.
- `POST_RELAY_ALLOW_PRIVATE_HOSTS=true` for local-machine relay only.
- Existing connector secrets for GitHub, Vercel, Supabase, Google Drive, Shopify, HeyGen, and Metricool.

## Smoke tests
Use POST `/api/bridge/universal` with the universal bridge token.

### Secret names, no values
```json
{
  "action": "secrets.listNames",
  "token": "<universal-token>"
}
```

### Read
```json
{
  "action": "codex.readFile",
  "token": "<universal-token>",
  "payload": { "relativePath": "package.json" }
}
```

### Write
```json
{
  "action": "codex.writeFile",
  "token": "<universal-token>",
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
  "token": "<universal-token>",
  "approved": true,
  "payload": {
    "command": "node -v",
    "cwd": "."
  }
}
```

## POST relay example
POST `/api/bridge/post`:

```json
{
  "token": "<post-relay-token>",
  "approved": true,
  "url": "https://example.com/api/target",
  "method": "POST",
  "headers": { "Content-Type": "application/json" },
  "body": { "ok": true }
}
```

## Phone bridge examples
The phone bridge lets a phone client call a simpler token while the server injects internal bridge tokens.

### Phone to universal bridge
POST `/api/bridge/phone`:

```json
{
  "phoneToken": "<phone-token>",
  "route": "universal",
  "action": "codex.readFile",
  "payload": { "relativePath": "package.json" }
}
```

### Phone to POST relay
POST `/api/bridge/phone`:

```json
{
  "phoneToken": "<phone-token>",
  "route": "postRelay",
  "approved": true,
  "payload": {
    "url": "https://example.com/api/target",
    "method": "POST",
    "headers": { "Content-Type": "application/json" },
    "body": { "source": "phone" }
  }
}
```

## Permission expansion plan
1. Validate secret-name inventory.
2. Validate Codex read inside the exact machine folder.
3. Validate approved write inside the exact machine folder.
4. Validate approved execute inside the exact machine folder.
5. Validate phone-to-universal read.
6. Validate phone-to-universal approved write.
7. Validate phone-to-universal approved execute.
8. Validate POST relay to an allowlisted harmless target.
9. Validate Git status and non-destructive Git command.
10. Validate connector-specific dry-runs.
11. Only then widen to create/move/edit/delete for Drive, Shopify media, Supabase, Vercel, HeyGen, Metricool, and production systems.
