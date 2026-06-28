# GPT Agent Builder — MCP Gateway Connection

## Connect GPT Custom Agent to Strategic Minds MCP

### Step 1 — Add Action Schema
In GPT Agent Builder → Configure → Actions → Create Action:
- **Schema Type:** OpenAPI 3.1
- **Schema URL (import from):** `https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/schemas/openapi-gateway.json`

### Step 2 — Or paste the schema directly
URL: `https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/gateway`

The gateway accepts:
```json
POST /api/mcp/gateway
{
  "tool_id": "ops.github.create_file",
  "execution_mode": "FULL_AUTONOMOUS",
  "caller_agent": "gpt_agent_builder",
  "input": { "repo": "Strategic-Minds/AUTO_BUILDER", "path": "...", "content": "...", "message": "..." }
}
```

### Step 3 — Tool Discovery
```
GET /api/mcp/gateway → returns server list, namespace counts, tool counts
GET /api/mcp/universal-ops → returns all ops namespaces + provider status  
GET /api/mcp/xps-factory → returns active XPS projects + queue depth
```

### Step 4 — Execution Modes
| Mode | Behavior |
|------|----------|
| OBSERVE_ONLY | Read-only, no writes |
| DRAFT_ONLY | Creates drafts, no publish |
| APPROVAL_REQUIRED | Queues for human approval (default) |
| FULL_AUTONOMOUS | Executes immediately, receipts written |
| SUPERADMIN_EXECUTE | Full power, audit logged, rollback stored |

### Available Namespaces (45 ops + 21 xps = 66 total)
ops.github, ops.vercel, ops.supabase, ops.drive, ops.gmail, ops.sheets,
ops.openai, ops.twilio, ops.whatsapp, ops.n8n, ops.browser, ops.cron,
ops.queue, ops.webhooks, ops.receipts, ops.audit, ops.security, ops.rollback,
+ all social, content, and cloud namespaces

xps.project, xps.intake, xps.queue, xps.gates, xps.brand_pack, xps.website_pack,
xps.templates, xps.assets, xps.competitor_intel, xps.qa, xps.auto_fix,
xps.auto_heal, xps.auto_harden, xps.seo, xps.blog, xps.social, xps.payments,
xps.whatsapp, xps.calendar, xps.handoff, xps.receipts
