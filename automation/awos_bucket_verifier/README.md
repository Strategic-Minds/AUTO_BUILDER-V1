# AWOS Bucket Verifier

This package verifies each AWOS 5-minute bucket from a network-capable runner.

## What It Does

- fetches live `/api/recursive/status`
- fetches live `/api/health`
- writes canonical payload snapshots
- emits a standardized `PASS`, `WARN`, or `FAIL` JSON result
- appends a local verification log inside the runner workspace

## Files

- `awos_bucket_verifier.py` - core PASS/WARN/FAIL evaluator
- `awos_bucket_verify_and_log.py` - writes result JSON and appends a log
- `awos_capture_ingest_and_verify.py` - ingests payloads and triggers verification
- `awos_upstream_capture_runner.py` - fetches live endpoints and invokes the ingestion seam

## Workflow

The scheduled runner lives at `.github/workflows/awos-bucket-verifier.yml`.

It runs every 5 minutes and can also be started manually with `workflow_dispatch`.

## Safety

This workflow is read-only against the live AWOS runtime.

It verifies:

- bucket advancement
- scheduler execution
- sandbox-backed execution
- governed queue posture
- migration safety with `migrationStatus = staged_not_executed`

It does not mutate the staged Supabase migration.
