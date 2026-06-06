# Governed Git CLI Bridge

## Purpose

Enable GPT and Auto Builder runtime agents to read, write, and execute safe Git CLI operations through a governed bridge while preserving source-control discipline, audit receipts, and destructive-action approval gates.

## Route

```text
GET /api/bridge/git/cli
POST /api/bridge/git/cli
```

## Capabilities

### Read

Allowed without approval:

- `git status --short`
- `git status --branch --short`
- `git diff --stat`
- `git diff --name-only`
- `git diff`
- `git log --oneline -n <limit>`
- `git branch --show-current`
- `git branch --list`
- `git remote -v`
- `git rev-parse HEAD`
- `git rev-parse --abbrev-ref HEAD`

### Safe Write

Allowed in preview/sandbox or governed runtime:

- `git checkout -b <branch>`
- `git switch <branch>`
- `git switch -c <branch>`
- `git add <paths>`
- `git commit -m <message>`
- `git pull --ff-only`
- `git fetch --prune`
- `git push origin <branch>`

### Blocked By Default

Blocked unless exact destructive approval is present:

- `git reset --hard`
- `git clean -fd`
- `git push --force`
- `git push --force-with-lease`
- `git branch -D`
- `git rebase`
- `git filter-branch`
- `git checkout -- <path>`
- deleting refs
- arbitrary shell execution
- command chaining with `;`, `&&`, `||`, backticks, or `$()`

## Required Request Shape

```json
{
  "repoPath": "/workspace/repo",
  "operation": "status",
  "args": ["--short"],
  "reason": "Inspect branch state before editing Shopify V1 website.",
  "requestedBy": "Eden Runtime",
  "approvalPhrase": ""
}
```

## Response Shape

```json
{
  "ok": true,
  "operation": "status",
  "command": "git status --short",
  "stdout": "",
  "stderr": "",
  "exitCode": 0,
  "receipt": {
    "targetSystem": "git",
    "operation": "status",
    "safeClass": "read",
    "blocked": false,
    "timestamp": ""
  }
}
```

## Required Environment

```text
GIT_CLI_BRIDGE_ENABLED=true
GIT_CLI_BRIDGE_TOKEN=<secret>
GIT_CLI_ALLOWED_REPOS=/workspace/AUTO_BUILDER,/workspace/EDENSKYESTUDIOS
```

Optional:

```text
GIT_CLI_DESTRUCTIVE_APPROVAL_PHRASE=APPROVE GIT DESTRUCTIVE EXECUTION
```

## Authentication

All `POST` calls must include:

```http
Authorization: Bearer <GIT_CLI_BRIDGE_TOKEN>
```

`GET` may return readiness without exposing secrets.

## Receipts

Every command must create a receipt containing:

- repo path
- branch
- operation
- command
- safe class
- exit code
- stdout/stderr summary
- timestamp
- blocked reason, if blocked

## Eden Shopify Rule

When the target work involves the Eden Shopify V1 website, the bridge must enforce:

```text
branch = shopify/v1-website-preview
```

unless Jeremy explicitly names another branch in the current session.

## Production Governance

This bridge does not authorize:

- production deploy
- Shopify publish/mutation
- payment mutation
- public publishing
- Supabase production migration
- destructive Git actions without exact destructive approval
