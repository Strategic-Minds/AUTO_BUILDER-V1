# GPT Action Setup

Use the published `openapi.yaml` from this repo as the action schema.

Recommended live action base:
- `https://auto-builder-strategic-minds-advisory.vercel.app`

Primary action routes:
- `/api/health`
- `/api/providers`
- `/api/autobuilder/prompts`
- `/api/autobuilder/workflow`
- `/api/autobuilder/loop`
- `/api/autobuilder/validate`
- `/api/autobuilder/audit`
- `/api/autobuilder/readiness`
- `/api/autobuilder/repos`

Bearer auth:
- `Authorization: Bearer {{BRIDGE_API_KEY}}`

Project instruction:
- Start every substantial run from `CREATE A SYSTEM`, `CREATE A WORKFLOW`, or `CREATE AN AGENT`.
