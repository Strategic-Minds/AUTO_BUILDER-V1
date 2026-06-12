# Eden Skye Canonical Asset Installer

Preview-only recovery runner for installing the Eden Skye canonical asset package into Drive.

Historical build provenance: this system originated as the Phase 3 / Step 35 Drive placement runner. The durable system name is now **Eden Skye Canonical Asset Installer** and the runtime service name is `eden-canonical-asset-installer`.

## Scope

This runner is allowed to create the listed clean canonical asset subfolders and upload the mapped package files only. It must not delete, overwrite, or move existing Drive files. It must not deploy production, mutate Shopify, activate payments, publish social content, activate HeyGen, change unrelated secrets, run live database migrations, or mark any image `approved_public`.

## Routes

The route path remains stable for compatibility while response labels use the canonical system name.

- `GET /api/eden-step35/hosted-runner/health` reports readiness and missing configuration.
- `GET /api/eden-step35/hosted-runner/dry-run` returns the existing dry-run manifest without mutation.
- `POST /api/eden-step35/hosted-runner/execute` performs guarded Drive placement only after all gates pass.

## Required Preview Environment

Set these on the preview deployment only:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `EDEN_CANONICAL_ASSET_PACKAGE_BASE_URL`

Legacy fallback supported during transition:

- `STEP35_PACKAGE_BASE_URL`

The preferred Eden Skye configuration is the single `GOOGLE_SERVICE_ACCOUNT_JSON` value. Do not separately require `GOOGLE_PRIVATE_KEY` when the service-account JSON is already configured.

`EDEN_CANONICAL_ASSET_PACKAGE_BASE_URL` must point at an approved hosted copy of the canonical asset installer package contents, preserving relative paths such as `openapi/eden-image-install-executor.openapi.yaml` and `images/eden-canonical-01-flagship-hero.png`.

Do not commit service-account JSON or private keys to the repo.

## Guardrails

The execute route blocks when:

- Google credentials are missing or malformed.
- The canonical asset package base URL is missing.
- Any placement row attempts `approved_public`.
- Required Drive parent or subfolder fields are missing.

The Drive REST helper creates missing canonical asset subfolders, skips existing files with the same name, and uploads only missing mapped files.

## Known Blocker From Local Recovery Runtime

The local container had the service-account JSON installed and validated, but outbound Google API access failed with `ENETUNREACH`. This hosted runner exists to move only the approved Drive placement step into an environment with Google API network access.

## Verification Checklist

1. Confirm deployment is preview-only.
2. Confirm production aliases are not assigned.
3. Confirm preview environment includes `GOOGLE_SERVICE_ACCOUNT_JSON` and `EDEN_CANONICAL_ASSET_PACKAGE_BASE_URL`.
4. Run `GET /api/eden-step35/hosted-runner/health`.
5. Run `GET /api/eden-step35/hosted-runner/dry-run`.
6. Run `POST /api/eden-step35/hosted-runner/execute` only after health reports `has_google_credential=true`, `has_asset_package_base_url=true`, and dry-run shows no validation errors.
7. Review receipts and verify no files were deleted, overwritten, or moved.
