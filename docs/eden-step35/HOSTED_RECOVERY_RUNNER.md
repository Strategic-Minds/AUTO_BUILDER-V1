# Eden Step 35 Hosted Recovery Runner

Preview-only recovery runner for the Eden Skye Step 35 Drive placement package.

## Scope

This runner is allowed to create the listed clean Step 35 subfolders and upload the mapped Step 35 package files only. It must not delete, overwrite, or move existing Drive files. It must not deploy production, mutate Shopify, activate payments, publish social content, activate HeyGen, change unrelated secrets, run live database migrations, or mark any image `approved_public`.

## Routes

- `GET /api/eden-step35/hosted-runner/health` reports readiness and missing configuration.
- `GET /api/eden-step35/hosted-runner/dry-run` returns the existing staged dry-run manifest without mutation.
- `POST /api/eden-step35/hosted-runner/execute` performs guarded Drive placement only after all gates pass.

## Required Preview Environment

Set these on the preview deployment only:

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `STEP35_PACKAGE_BASE_URL`

The runner also supports split Google credentials, but the preferred Eden Step 35 configuration is the single `GOOGLE_SERVICE_ACCOUNT_JSON` value. Do not separately require `GOOGLE_PRIVATE_KEY` when the service-account JSON is already configured.

`STEP35_PACKAGE_BASE_URL` must point at an approved hosted copy of the Step 35 package contents, preserving relative paths such as `openapi/eden-image-install-executor.openapi.yaml` and `images/eden-canonical-01-flagship-hero.png`.

Do not commit service-account JSON or private keys to the repo.

## Guardrails

The execute route blocks when:

- Google credentials are missing or malformed.
- The Step 35 artifact base URL is missing.
- Any placement row attempts `approved_public`.
- Required Drive parent or subfolder fields are missing.

The Drive REST helper creates missing Step 35 subfolders, skips existing files with the same name, and uploads only missing mapped files.

## Known Blocker From Local Recovery Runtime

The local container had the service-account JSON installed and validated, but outbound Google API access failed with `ENETUNREACH`. This hosted runner exists to move only the approved Drive placement step into an environment with Google API network access.

## Verification Checklist

1. Confirm deployment is preview-only.
2. Confirm production aliases are not assigned.
3. Confirm preview environment includes `GOOGLE_SERVICE_ACCOUNT_JSON` and `STEP35_PACKAGE_BASE_URL`.
4. Run `GET /api/eden-step35/hosted-runner/health`.
5. Run `GET /api/eden-step35/hosted-runner/dry-run`.
6. Run `POST /api/eden-step35/hosted-runner/execute` only after health reports `has_google_credential=true`, `has_step35_package_base_url=true`, and dry-run shows no validation errors.
7. Review receipts and verify no files were deleted, overwritten, or moved.
