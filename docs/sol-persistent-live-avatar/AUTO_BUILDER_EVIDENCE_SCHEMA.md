# AUTO BUILDER Evidence Schema

Project: SOL Persistent Live Avatar Assistant v1
Mode: governed evidence payload standard

## Purpose
Define the normalized evidence schema for all runtime execution, deployment validation, sandbox execution, cron activity, rollback events, and cross-stack automation actions.

## Core Evidence Payload

```json
{
  "timestamp_utc": "2026-01-01T00:00:00Z",
  "phase": "PHASE-X",
  "step": "STEP-Y",
  "runtime_mode": "sandbox",
  "environment": "staging",
  "actor": "AUTO BUILDER 2",
  "system": "Vercel",
  "connector": "vercel-mcp",
  "action": "preview_deploy",
  "approval_level": "staging-approved",
  "branch": "staging/sol-v1",
  "commit_sha": "abcdef123456",
  "result": "pass",
  "evidence_reference": "logs/deploy-001.txt",
  "rollback_reference": "rollback-001",
  "notes": "deployment healthy"
}
```

## Deployment Evidence Schema

```json
{
  "provider": "Vercel",
  "project": "sol-avatar-assistant",
  "environment": "preview",
  "deployment_id": "dpl_xxx",
  "deployment_url": "https://preview.example.com",
  "build_status": "success",
  "health_route_status": "200",
  "policy_gate_status": "pass",
  "rollback_target": "commit-sha",
  "log_reference": "logs/vercel-preview.log"
}
```

## Supabase Evidence Schema

```json
{
  "project": "sol-staging",
  "migration_name": "001_init.sql",
  "migration_status": "applied",
  "rls_validation": "pass",
  "rollback_point": "snapshot-001",
  "schema_hash": "abc123",
  "log_reference": "logs/supabase-migration.log"
}
```

## OpenAI Route Evidence Schema

```json
{
  "route": "/api/chat",
  "model": "gpt-5.5",
  "policy_gate": "pass",
  "latency_ms": 1200,
  "response_status": 200,
  "error_state": "none",
  "log_reference": "logs/openai-route.log"
}
```

## HeyGen Evidence Schema

```json
{
  "avatar_id": "sol-secretary-v1",
  "voice_id": "UP48mwI3wnW9ZI4C5PoL",
  "streaming_enabled": true,
  "video_test_status": "pass",
  "avatar_ready": true,
  "entitlement_verified": true,
  "log_reference": "logs/heygen-validation.log"
}
```

## Cron Evidence Schema

```json
{
  "cron_name": "sol-runtime-check",
  "cron_expression": "*/5 * * * *",
  "environment": "staging",
  "target_route": "/api/runtime/check",
  "last_run_utc": "2026-01-01T00:05:00Z",
  "last_status": "success",
  "failure_reference": "none",
  "pause_method": "disable-vercel-cron"
}
```

## Sandbox Validation Schema

```json
{
  "runtime_id": "sandbox-001",
  "install_result": "pass",
  "lint_result": "pass",
  "typecheck_result": "pass",
  "build_result": "pass",
  "policy_gate_result": "pass",
  "openai_validation": "pass",
  "supabase_validation": "pass",
  "heygen_validation": "pass",
  "failure_recovery": "none"
}
```

## Rollback Event Schema

```json
{
  "rollback_id": "rollback-001",
  "trigger_reason": "preview failure",
  "environment": "staging",
  "rollback_target": "commit-sha",
  "workflow_pause": true,
  "recovery_owner": "AUTO BUILDER",
  "validation_after_rollback": "pass",
  "final_state": "stable"
}
```

## Cross-Stack Audit Event Schema

```json
{
  "source_system": "GitHub",
  "target_system": "Vercel",
  "action_type": "deploy",
  "actor": "AUTO BUILDER 2",
  "risk_level": "medium",
  "approval_required": true,
  "result": "success",
  "evidence_reference": "logs/deploy.log",
  "rollback_reference": "rollback-001"
}
```

## Governance Rules
- Evidence must be immutable once recorded.
- Secret values must never appear in logs.
- Approval evidence is mandatory for production actions.
- Staging and production evidence must remain isolated.
- Failed validations must include recovery notes.
- All evidence must map back to a commit SHA or deployment ID.
