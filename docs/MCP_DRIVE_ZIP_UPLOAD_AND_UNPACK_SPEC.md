# MCP Drive ZIP Upload And Unpack Spec

## Purpose

This spec defines the governed Drive ZIP surface for AUTO BUILDER:

- `drive_upload_zip`
- `drive_unpack_zip_to_folder`
- `drive_install_zip_package`

The tools are designed for sandbox-first execution, strict allowlisting, explicit operator approval, and audit receipt generation.

## Release Gates

The ZIP tools do not bypass release gates.

- Default mode is `dry_run`
- Live writes require `mode=approved_write`
- Live writes require operator email `strategicmindsadvisory@gmail.com`
- Live writes require the target folder to be allowlisted
- No production deploys are performed
- No payments, social publishing, Shopify mutations, Supabase production migrations, or HeyGen live actions are triggered

## Allowlisted Targets

| Label | Folder ID |
|---|---|
| EDEN_SKYE_STUDIOS_OS | `1oCEjD6kUm9FiYDh1w-dNE9PPiggj65MQ` |
| V2 MASTER AUTO BUILDER | `13uLhv0NRhmdCdJCCLrroLzyRRttoXtpr` |

## Tool: `drive_upload_zip`

### Inputs

- `source_file_path`
- `target_folder_id`
- `title`
- `mode`: `dry_run | approved_write`
- `operator_email`
- `receipt_path` optional

### Behavior

- Validate the file exists
- Validate `.zip` extension
- Validate ZIP signature and parse entries
- Compute SHA-256
- Dry run returns a plan only
- Approved write uploads the ZIP as raw Drive media without conversion
- Receipt path:
  - `data/factory/receipts/drive-zip-upload-{timestamp}.json`

## Tool: `drive_unpack_zip_to_folder`

### Inputs

- `source_file_path`
- `target_folder_id`
- `install_folder_name`
- `mode`: `dry_run | approved_write`
- `operator_email`
- `allow_binary_files` default `false`
- `blocked_extensions` optional
- `receipt_path` optional

### ZIP Entry Rules

Before any write, every entry is scanned and blocked if it matches any of the following:

- Path traversal: `../`, `..\\`
- Absolute paths: `/path`, `C:\path`
- Secret files:
  - `.env`
  - `.env.local`
  - `.env.production`
  - `*.pem`
  - `*.key`
  - `*.p12`
  - `*.pfx`
  - `credentials*.json`
  - `service-account*.json`
- Executables by default:
  - `*.exe`
  - `*.dll`
  - `*.bat`
  - `*.cmd`
  - `*.ps1`
  - `*.sh`

### Behavior

- Dry run returns an install plan only
- Approved write creates the install folder
- Subfolders are recreated
- Allowed files are uploaded into the recreated structure
- Receipt path:
  - `data/factory/receipts/drive-zip-unpack-{timestamp}.json`

## Tool: `drive_install_zip_package`

### Inputs

- `source_file_path`
- `target_folder_id`
- `install_folder_name`
- `package_type`
  - `eden_shopify_generator_docs`
  - `eden_visual_source_truth`
  - `auto_builder_packet`
  - `general`
- `mode`: `dry_run | approved_write`
- `operator_email`
- `unpack` boolean
- `validate_manifest` boolean

### Behavior

- In approved write mode, preserve the original ZIP as a raw Drive file first
- Optionally unpack into the install folder
- If `validate_manifest=true`, require package-specific manifest files for known package types
- Receipt path:
  - `data/factory/receipts/drive-zip-install-{timestamp}.json`

## Validation Expectations

- Dry-run upload returns plan only
- Approved write requires allowed folder
- Approved write requires operator email
- Unpack rejects path traversal
- Unpack rejects secret files
- Unpack rejects executable files
- Install package validates manifest requirements
- Receipts are generated
- Release gates remain locked
