# Autonomous Control Plane Receipt Persistence Operations

## Status

Branch-safe implementation packet for writing autonomous control-plane run-loop receipts into the approved Supabase tables.

## Production Tables

- `public.autonomous_control_plane_runs`
- `public.autonomous_control_plane_tasks`

Migration applied separately as `20260610093828_autonomous_control_plane_persistence`.

## Runtime Enablement

Receipt persistence remains disabled unless this environment variable is set:

```txt
AUTONOMOUS_CONTROL_PLANE_PERSISTENCE_ENABLED=1
```

Required Supabase credentials:

```txt
SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY
```

## Behavior

When enabled, `/api/autonomous-control-plane/run-loop` writes one row to `autonomous_control_plane_runs` and upserts the completed/blocked queue tasks into `autonomous_control_plane_tasks`.

The route still returns `productionActionAllowed:false` and does not perform production deploys, billing, schema mutation, external publishing, or connector mutation.

## Safe Verification

1. Deploy the branch to preview.
2. Confirm `npm run validate:autonomous-control-plane` passes.
3. In preview or production with persistence enabled, call `/api/autonomous-control-plane/run-loop`.
4. Confirm the JSON response includes `persistence.status = persisted`.
5. Query Supabase for the matching `run_key`.

## Rollback

Disable persistence immediately by removing or changing:

```txt
AUTONOMOUS_CONTROL_PLANE_PERSISTENCE_ENABLED=1
```

Schema rollback remains:

```sql
drop table if exists public.autonomous_control_plane_tasks;
drop table if exists public.autonomous_control_plane_runs;
```
