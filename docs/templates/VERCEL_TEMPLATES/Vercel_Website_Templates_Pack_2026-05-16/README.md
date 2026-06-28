# Vercel Website Templates Pack — Curated for Website Template Library

Date: 2026-05-16

This packet organizes the strongest-fit Vercel templates by requested use case:

1. SaaS
2. B2B
3. Content Creation
4. Workflow
5. Agents
6. Crons
7. Sandbox
8. v0.app / v0 API

## Recommended Collection

| Category | Primary Pick | GitHub Repository | Why It Belongs |
|---|---|---|---|
| SaaS | Next.js SaaS Starter | `nextjs/saas-starter` | Best general SaaS foundation with auth, payments, and dashboard structure. |
| SaaS Alternate | Update SaaS Starter | `updatedotdev/nextjs-supabase-stripe-update` | Strong Supabase + Stripe starter. |
| B2B | B2B Multi-Tenant Starter Kit | `stack-auth/multi-tenant-starter-template` | Strong business app starter with organizations, auth, dashboard, and account settings. |
| Content Creation | Mux AI + Vercel Workflows Starter | `muxinc/nextjs-video-ai-workflows` | Best fit for AI video/content pipelines. |
| Content Creation Alternate | Remotion on Vercel | `remotion-dev/template-vercel` | Best programmatic video rendering template. |
| Workflow | Workflow Builder | `vercel-labs/workflow-builder-template` | Strong visual workflow automation starter. |
| Workflow Alternate | Tersa AI Workflow Canvas | `vercel-labs/tersa` | Strong visual AI workflow playground. |
| Agents | Coding Agent Template | `vercel-labs/coding-agent-template` | Strongest agentic coding template using Vercel Sandbox. |
| Agents Alternate | Open Agents | `vercel-labs/open-agents` | Better for background coding-agent operations. |
| Agents Alternate | OpenAI Agents SDK + FastAPI | `vercel-labs/openai-agents-python-template` | Strong Python agentic starter. |
| Crons | Vercel Cron Job Example | `vercel/examples` (`solutions/cron`) | Official clean cron-job starter. |
| Sandbox | OpenAI Agents SDK + FastAPI | `vercel-labs/openai-agents-python-template` | Explicit Vercel Sandbox use case. |
| Sandbox Alternate | Remotion on Vercel | `remotion-dev/template-vercel` | Uses Sandbox for media rendering workflows. |
| v0.app | v0 Platform API Demo / v0 Clone | `vercel/v0-sdk` | Best available v0-style programmatic app-generation starter. |

## What To Put In Your Website Template Library

Use these top-level folders:

```text
website-templates/
  01-saas/
  02-b2b/
  03-content-creation/
  04-workflow/
  05-agents/
  06-crons/
  07-sandbox/
  08-v0/
```

## Suggested Placement

- `01-saas/nextjs-saas-starter`
- `01-saas/update-saas-starter`
- `02-b2b/multi-tenant-starter`
- `03-content-creation/mux-ai-video-workflows`
- `03-content-creation/remotion-vercel`
- `04-workflow/workflow-builder`
- `04-workflow/tersa`
- `05-agents/coding-agent-template`
- `05-agents/open-agents`
- `05-agents/openai-agents-python-template`
- `06-crons/vercel-cron-example`
- `07-sandbox/openai-agents-python-template`
- `07-sandbox/remotion-vercel`
- `08-v0/v0-sdk`

## Fastest Way To Download Everything

Run:

```bash
bash clone-vercel-template-library.sh
```

This creates a `website-templates/` folder and clones every repository into the category folder shown above.

## Notes

- Some repositories are multi-purpose and appear in more than one category because they fit multiple requested buckets.
- The cron example lives inside the `vercel/examples` monorepo under `solutions/cron`.
- Review each template license and dependency stack before redistributing or bundling in a public template marketplace.
- For production use, run dependency audits, update environment variable templates, and verify the current Vercel deployment instructions.
