# Git CLI Bridge Activation

## Route

```text
GET /api/bridge/git/cli
POST /api/bridge/git/cli
```

## Required Vercel Environment Variables

```text
GIT_CLI_BRIDGE_ENABLED=true
GIT_CLI_BRIDGE_TOKEN=<strong secret token>
GIT_CLI_ALLOWED_REPOS=/workspace/AUTO_BUILDER,/workspace/EDENSKYESTUDIOS
```

Optional:

```text
GIT_CLI_DESTRUCTIVE_APPROVAL_PHRASE=APPROVE GIT DESTRUCTIVE EXECUTION
```

## GPT Usage Pattern

Readiness:

```http
GET /api/bridge/git/cli
```

Run safe Git status:

```http
POST /api/bridge/git/cli
Authorization: Bearer <GIT_CLI_BRIDGE_TOKEN>
Content-Type: application/json
```

```json
{
  "repoPath": "/workspace/EDENSKYESTUDIOS",
  "operation": "status_branch",
  "reason": "Check Eden Shopify V1 branch before editing.",
  "requestedBy": "Eden Runtime"
}
```

Commit safe changes:

```json
{
  "repoPath": "/workspace/EDENSKYESTUDIOS",
  "operation": "commit",
  "args": ["Update Shopify V1 website preview"],
  "reason": "Commit reversible Shopify preview branch work.",
  "requestedBy": "Eden Runtime"
}
```

Push safe branch:

```json
{
  "repoPath": "/workspace/EDENSKYESTUDIOS",
  "operation": "push_branch",
  "args": ["shopify/v1-website-preview"],
  "reason": "Push Shopify preview branch for screenshot validation.",
  "requestedBy": "Eden Runtime"
}
```

## Safety Contract

This bridge executes only `git` through `execFile`, not shell strings.

It blocks:

- command chaining
- arbitrary shell
- force push
- hard reset
- clean delete
- branch deletion
- rebase/history rewrite

## Eden Shopify V1 Rule

When editing the Shopify V1 site, GPT must use:

```text
shopify/v1-website-preview
```

and must capture screenshot proof after meaningful visual edits.

## Receipt Requirement

Every call returns a receipt with:

- target system
- operation
- repo path
- command
- safe class
- requester
- reason
- timestamp
- success/failure

## Activation Status

The code bridge is installed in Auto Builder source. It becomes live after Auto Builder is deployed with the required environment variables.
