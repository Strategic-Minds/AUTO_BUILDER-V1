# Vercel Control Plane Routes

The GPT calls these routes through GPT Actions. The routes then perform governed provider work.

- `POST /api/control-plane/project/intake`
- `POST /api/control-plane/discovery/run`
- `POST /api/control-plane/competitive/top3`
- `POST /api/control-plane/strategy/consultation-pack`
- `POST /api/control-plane/approval/create-form`
- `POST /api/control-plane/drive/scaffold`
- `POST /api/control-plane/github/scaffold`
- `POST /api/control-plane/supabase/staging-migration`
- `POST /api/control-plane/vercel/preview`
- `POST /api/control-plane/qa/run`
- `POST /api/control-plane/autoheal/run`
- `POST /api/control-plane/comms/draft`
- `POST /api/control-plane/archive/finish`
- `GET /api/cron/auto-builder`

All write-capable routes require:
- `mode`
- `approval_id` when protected
- `dry_run` default true
- receipt output
