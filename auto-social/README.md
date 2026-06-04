# Eden Skye Auto Social Bootstrap

This folder contains the additive Git bootstrap package for the Eden Skye Studios AUTO SOCIAL system discovered from Google Drive on 2026-06-04.

## Source Locations

- Drive studio root: `EDEN SKYE STUDIOS`
  - Current root: https://drive.google.com/drive/folders/1Agdaq28Lha01ASVdpm1g_CS_x_aObRcT
  - Parent/root wrapper also found: https://drive.google.com/drive/folders/1_oW9mJgdm2OD-RWi3URRX4oVkTkOzsQK
- AUTO SOCIAL folder: https://drive.google.com/drive/folders/1jr4mrgdzvdywfY9j-QD4Ma2LurR9yLo9
- Avatar network: https://drive.google.com/drive/folders/19qdJPbuWdPxl9oU6KKYR-IWIoGRpHlhw
- Git bootstrap bridge: https://drive.google.com/drive/folders/1u3PVJ4Xonw_dYnfXl0iQudOPuN8S3yxB

## Bootstrap Scope

AUTO SOCIAL is a sandbox-first social and avatar operating layer for Eden OS. It should connect Drive, GitHub, Vercel, and Supabase through governed bridge metadata before any live mutation.

The discovered Drive package includes:

- governance docs and approval placeholders
- avatar registry and avatar folders
- GitHub/Vercel/Supabase runbook placeholders
- autonomous bridge config
- workflow stubs
- prompt stubs
- Supabase schema draft
- Vercel cron draft

## Repos

- Source/orchestration: `Strategic-Minds/AUTO_BUILDER`
- Sandbox/build lane: `Strategic-Minds/SANDBOX`
- Frontend/deployable lane: `Strategic-Minds/FRONTEND`

## Operating Rules

- Sandbox first.
- No production deploy without approval.
- No Shopify mutation without approval.
- No public publishing without approval.
- No payment, discount, billing, Vercel env, Supabase schema, governance, or account mutation without approval.
- Treat cron as triggers, not workers.
- Use queues, receipts, and validation logs for continuity.

## Current Bootstrap State

This is a Git source package, not a live activation. It records the necessary discovery, avatar registry, environment placeholders, Vercel cron draft, and Supabase migration draft so the Auto Builder control plane can use them safely in a later sandbox implementation pass.

## Recommended Next Pass

1. Rehydrate from this folder and the Drive AUTO SOCIAL folder.
2. Promote bridge scaffolding into the sandbox repo only after confirming package placement.
3. Wire bridge routes to queue-backed Supabase tables in sandbox.
4. Validate cron endpoints locally or in sandbox preview.
5. Produce approval receipts before any production deploy or publishing action.
