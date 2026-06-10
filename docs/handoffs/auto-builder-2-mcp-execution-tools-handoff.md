# Auto Builder 2 MCP Execution Tools Handoff

## What Changed

Auto Builder 2 now exposes the advertised execution tools as callable MCP tools through `src/app/api/mcp/route.ts`.

The implementation adds a shared execution contract in `src/lib/autobuilder-v2/execution-tools.ts` with:

- `JobMode`: `read`, `dry_run`, `draft`, `execute`, `rollback`
- `UniversalJobInput`
- `ToolResult`
- shared receipt metadata
- shared rollback metadata
- response sanitization for secret-like keys and configured secret values
- the active operating map for Auto Builder 2 without SANDBOX or FRONTEND

Write-capable tools default to `dry_run`. Live mutation is not allowed unless `mode` is `execute` and the provider-specific adapter and approval gate allow the operation.

## Tools Exposed

Existing read/inspection tools preserved:

- `health_check`
- `get_repo_summary`
- `list_repo_files`
- `read_bootstrap_status`
- `read_text_file`

Execution tools now callable:

- `run_job`
- `run_universal_job`
- `run_drive_job`
- `drive_list_tree`
- `drive_create_folder`
- `drive_move_folder`
- `drive_move_file`
- `drive_write_receipt`
- `run_platform_provisioning_job`
- `create_github_repo`
- `create_vercel_project`
- `create_vercel_workflow`
- `create_vercel_agent`
- `create_ai_gateway`
- `rollback`

Existing browser, Eden, upload, and sandbox tools remain registered for backwards compatibility.

## GPT Action Bridge Routes

The OpenAPI paths in `docs/auto-builder-2-gpt-actions.openapi.yaml` are backed by Next.js routes:

- `/api/bridge/run-job`
- `/api/bridge/run-universal-job`
- `/api/bridge/drive/run-drive-job`
- `/api/bridge/drive/list-tree`
- `/api/bridge/drive/create-folder`
- `/api/bridge/drive/move-folder`
- `/api/bridge/drive/move-file`
- `/api/bridge/drive/write-receipt`
- `/api/bridge/platform/run-platform-provisioning-job`
- `/api/bridge/github/create-repo`
- `/api/bridge/vercel/create-project`
- `/api/bridge/vercel/create-workflow`
- `/api/bridge/vercel/create-agent`
- `/api/bridge/ai-gateway/create`
- `/api/bridge/rollback`

`dry_run`, `draft`, and `read` requests are safe planning calls. `execute` and `rollback` requests require a bearer token matching `AUTO_BUILDER_OPERATOR_TOKEN` or `AUTO_BUILDER_BRIDGE_TOKEN`.

## Active Operating Map

- Auto Builder Control Plane: `Strategic-Minds/AUTO_BUILDER`
- Eden App Repo: `Strategic-Minds/EDENSKYESTUDIOS`
- Vercel App: `edenskyestudios`
- Supabase Project: `Strategic Minds Advisory`
- Shopify Store: `Eden Skye Studios`
- Drive Command Folder: `V2 MASTER AUTO BUILDER`
- Drive Command Folder ID: `13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr`

## Required Environment Variable Names

Values must stay in provider secret storage and must never be returned in tool responses.

- `AUTO_BUILDER_OPERATOR_TOKEN`
- `AUTO_BUILDER_BRIDGE_TOKEN`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `GITHUB_TOKEN`
- `GITHUB_ORG`
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SHOPIFY_SHOP`
- `SHOPIFY_ADMIN_TOKEN`
- `AI_GATEWAY_API_KEY`
- `OPENAI_API_KEY`
- `GROQ_API_KEY`

## Example Dry Run Calls

`run_job`

```json
{
  "job_id": "job-001",
  "mode": "dry_run",
  "action": "prepare_eden_release_packet",
  "target_system": "github",
  "payload": {
    "repo": "Strategic-Minds/EDENSKYESTUDIOS"
  }
}
```

`drive_create_folder`

```json
{
  "job_id": "drive-folder-001",
  "mode": "dry_run",
  "parent_folder_id": "13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr",
  "folder_name": "Receipts"
}
```

`create_github_repo`

```json
{
  "job_id": "github-repo-001",
  "mode": "dry_run",
  "owner": "Strategic-Minds",
  "repo_name": "example-auto-builder-output",
  "visibility": "private",
  "initialize_readme": true
}
```

`create_vercel_project`

```json
{
  "job_id": "vercel-project-001",
  "mode": "dry_run",
  "team_id": "team-id",
  "project_name": "example-auto-builder-output",
  "framework": "nextjs"
}
```

`rollback`

```json
{
  "job_id": "rollback-001",
  "mode": "dry_run",
  "original_job_id": "github-repo-001",
  "rollback_type": "delete_created_repo",
  "rollback_payload": {
    "repo": "Strategic-Minds/example-auto-builder-output"
  }
}
```

## How To Test In ChatGPT

1. Reload the MCP connection for Auto Builder 2.
2. Ask ChatGPT to call `health_check`.
3. Ask ChatGPT to list tools or call `read_bootstrap_status`.
4. Confirm the expected execution tools are visible.
5. Call `run_job` with `mode: "dry_run"`.
6. Call `drive_create_folder` with `mode: "dry_run"` and confirm the response includes `data.would_create_folder`.
7. Call `create_github_repo` with `mode: "dry_run"` and confirm the response includes `data.would_create_repo`.
8. Confirm each response includes `receipt`, `rollback`, `timestamp`, and no secret values.

## How To Verify No Secrets Are Returned

Run:

```bash
npm run validate:mcp-tools
```

The validation checks:

- required read tools are still registered
- required execution tools are registered
- dry-run response markers exist for key tools
- execute-only paths are gated
- no source file contains a hardcoded value for the required secret names
- tool responses are built through the sanitizing result helper

## Reloading The MCP Connection

After the branch is merged and deployed:

1. Open ChatGPT settings for the Auto Builder 2 MCP connection.
2. Disconnect or refresh the connector.
3. Reconnect to the deployed MCP URL.
4. Start a fresh chat.
5. Call `health_check`, then `read_bootstrap_status`.

## Adapter Status

Real adapter routing exists for:

- `run_universal_job` through the existing universal fallback runner
- `run_drive_job` through the existing Drive planning runner
- `drive_create_folder` through the existing Google Drive folder adapter, still approval-gated
- `create_github_repo` through the existing GitHub adapter, still approval-gated
- `create_vercel_project` through the existing Vercel adapter, still approval-gated

Dry-run-safe or adapter-required stubs exist for:

- `drive_list_tree`
- `drive_move_folder`
- `drive_move_file`
- `drive_write_receipt`
- `create_vercel_workflow`
- `create_vercel_agent`
- `create_ai_gateway`
- `rollback`

No production deployment is included in this change.
