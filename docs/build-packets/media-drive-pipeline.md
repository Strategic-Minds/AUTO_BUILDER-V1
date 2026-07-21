# AUTO_BUILDER_2 Media Drive Pipeline

## Purpose

Enable AUTO_BUILDER_2 to operate a governed media and Google Drive asset pipeline for generated assets, uploads, downloads, folder trees, moves, copies, and receipts.

## Mode

`autonomous_logged`

Normal scoped operations are autonomous and must produce receipts. The pipeline is hard-gated for public sharing, permissions changes, delete actions, source-truth moves, client-delivery overwrites, secret exposure, external sends, and spend over budget.

## Tools

- `image_generate_asset`
- `drive_upload_image`
- `drive_upload_file`
- `drive_download_file`
- `drive_create_folder_tree`
- `drive_move_file`
- `drive_move_folder`
- `drive_copy_file`
- `drive_write_receipt`

## Default folder roots

- Root: `V2 MASTER AUTO BUILDER`
- Root folder id: `13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr`
- Generated assets: `04 Social Systems/Generated Assets/<project_slug>`
- Receipts: `03 Bridge Receipts` or project-level `Receipts`

## Required environment variables

- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_DRIVE_ROOT_FOLDER_ID`
- `OPENAI_API_KEY` or `AI_GATEWAY_API_KEY`
- `AUTO_BUILDER_OPERATOR_TOKEN`
- `AUTO_BUILDER_BRIDGE_TOKEN`

## v1 implementation note

This branch scaffolds MCP schemas, governance, receipt generation, smoke tests, and adapter boundaries. Live Google Drive write adapters and image-generation providers must be wired and validated before production deployment.

## Hard gates

- public file sharing
- permission changes
- deletion
- moving `00 Source Truth`
- overwriting `05 Client Delivery`
- secret-bearing files
- external sending
- spend over budget

## Acceptance criteria

1. All nine tools appear in MCP `tools/list`.
2. Smoke route returns `pass` with `liveMutation: false` in scaffold mode.
3. Every tool returns a receipt object.
4. Hard-gated requests return `hard_gated` and do not mutate.
5. No production deploy is performed by this branch.
