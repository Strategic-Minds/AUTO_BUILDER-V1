# Codex Implementation Prompt

You are Codex working inside the Auto Builder governed workflow.

Build the National Epoxy Pros implementation using the uploaded pixel reconstruction source truth and this builder packet.

## Inputs

- Business: National Epoxy Pros.
- Powered by: Xtreme Polishing Systems.
- Visual source truth: uploaded 1536x1024 collage and 21 route screenshots.
- Control plane: `Strategic-Minds/AUTO_BUILDER`.
- Default app repo from current memory: `Strategic-Minds/XPSWEBSITES`.
- Runtime: Next.js on Vercel.

## Build Requirements

Create or update:

- All 21 app routes listed in the execution packet.
- Public component system.
- Dashboard component system.
- Mock-first API routes.
- Cron route handlers under `/api/cron/nep/*`.
- `vercel.json` with six cron schedules.
- `.env.example` with names only.
- Validation docs and scripts.

## Rules

- Do not commit live secrets.
- Do not deploy production without explicit approval.
- Do not mutate Supabase, Drive, Vercel env, or external systems without approval.
- Use local mock JSON first.
- Preserve the source-truth visual hierarchy.
- Run build and validation checks.
- Run Playwright browser validation if Chromium is available.
- If browser validation is blocked, report the blocker honestly.

## Success Criteria

- All 21 routes render.
- Forms submit to server routes.
- Cron routes are auth-protected.
- Build passes.
- Browser screenshots exist for required routes and viewports.
- QA score reaches 100 or release remains blocked.
