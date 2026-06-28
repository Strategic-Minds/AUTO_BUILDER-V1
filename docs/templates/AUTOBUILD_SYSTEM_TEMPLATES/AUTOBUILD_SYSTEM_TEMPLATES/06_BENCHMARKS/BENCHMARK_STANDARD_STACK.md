# Benchmark Standard Stack

## Purpose
This is the default benchmark stack for a modern GPT-driven business operating system.

It is not the only valid stack, but it is the best default benchmark for speed, maintainability, and modular delivery when the client wants GPT, scheduler-driven operations, admin UI, logs, memory, and controlled writes.

## Benchmark stack
### Source control
- GitHub

### Frontend and deployment
- Vercel
- Vite + React frontend
- PWA support

### Backend platform
- Supabase
- Postgres for durable data
- Auth for operators and admins
- Storage for artifacts and exports
- Edge/server functions for controlled actions

### Cache and queue
- Redis
- use for locks, heartbeats, queue state, retries, rate limiting, transient cache

### Workspace and operator surfaces
- Google Drive
- Google Docs / Sheets / Slides
- Gmail
- Google Calendar

### CRM and staging
- HubSpot for final CRM
- Airtable for staging when operationally useful

### Orchestration
- GPT Scheduler or scheduled GPT tasks as the bounded orchestration surface

### Monitoring and logs
- runtime ledger in database
- append-only run log
- connector health checks
- summary and blocker alerts via email

## Why this is the benchmark
- GitHub keeps canon, code, and version history
- Vercel fits a modern frontend and preview workflow
- Vite works well for a fast operator UI
- Supabase provides a practical default backend surface for most consultant builds
- Redis solves queue, lock, and heartbeat problems cleanly
- Google Workspace is an operator-friendly document and control plane layer
- HubSpot and Airtable fit many business operations patterns

## Practical benchmark account list
Minimum account set:
1. GitHub org or account
2. Vercel team and project
3. Supabase project
4. Redis account or Redis integration
5. Google Workspace account
6. HubSpot account if CRM matters
7. Airtable account if staging mirror matters

## Notes for Vercel-based benchmark
For Vite projects on Vercel, environment-aware variables can be exposed with `VITE_` prefixes, including deployment environment and production URL. Vercel also supports project environment variables by target, including production, preview, and development, and supports integrations for external services. These are useful when designing an environment-aware admin UI and preview workflow.
