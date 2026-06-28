# GPT Agent Builder — MCP Gateway Connection

## Connect GPT Custom Agent to Strategic Minds MCP

### Step 1 — Add Action Schema
In GPT Agent Builder → Configure → Actions → Create Action:
- **Schema URL:** `https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/schemas/openapi-gateway.json`
- **Or import from:** `https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/gateway` (GET = discovery)

### Step 2 — Execute any MCP tool
```json
POST /api/mcp/gateway
{
  "tool_id": "ops.github.create_file",
  "execution_mode": "FULL_AUTONOMOUS",
  "caller_agent": "gpt_agent_builder",
  "input": { "repo": "Strategic-Minds/AUTO_BUILDER", "path": "...", "content": "...", "message": "..." }
}
```

Response always includes: `run_id`, `receipt_id`, `rollback_id`, `status`, `production_mutated`

### Step 3 — Available Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/mcp/gateway | GET | Discover servers, namespaces, tools |
| /api/mcp/gateway | POST | Execute any MCP tool |
| /api/mcp/universal-ops | GET | List ops.* namespaces + provider status |
| /api/mcp/universal-ops | POST | Execute universal ops tool |
| /api/mcp/xps-factory | GET | XPS project stats (active, queue, gates) |
| /api/mcp/xps-factory | POST | Execute XPS workflow step |
| /api/mcp/webhook | POST | Receive provider webhook events |
| /api/mcp/gateway/{run_id} | GET | Get run status + receipt |

### Step 4 — Execution Modes
| Mode | Behavior |
|------|----------|
| OBSERVE_ONLY | Returns blocked — no writes |
| DRAFT_ONLY | Creates drafts, queues for approval |
| APPROVAL_REQUIRED | Queues — awaits human approval (default) |
| FULL_AUTONOMOUS | Executes immediately, writes receipt |
| SUPERADMIN_EXECUTE | Full power — audit log + rollback stored |

### Step 5 — XPS Schema Tables (GPT-readable)
All XPS factory tables are Supabase-backed with RLS. Access via `ops.supabase.select` tool.

| Table | Status | Columns | Description |
|-------|--------|---------|-------------|
| `factory_projects` | EXISTS | 23 | Canonical project record — links all entities |
| `factory_whatsapp_messages` | CREATED 2026-06-28 | 22 | Inbound/outbound WA with commands, gate_id, error state |
| `factory_image_assets` | EXISTS (audited) | 35 | All images — source, generated, Drive-hosted, licensed |
| `factory_receipts` | CREATED 2026-06-28 | 16 | XPS receipt ledger |
| `factory_receipts_full` | VIEW | — | UNION: mcp_receipts (XPS-tagged) + factory_receipts |

### Step 6 — Tool Namespaces (66 total)
**ops.*** (45): github, vercel, supabase, drive, gmail, sheets, openai, twilio, whatsapp,
n8n, browser, files, images, rag, cron, queue, webhooks, audit, receipts, security,
rollback, google_workspace, google_cloud, docs, slides, forms, calendar, tasks,
contacts, gpt_agents, base44, shopify, square, meta, facebook, instagram, snapchat,
pinterest, buffer, repurpose_io, heygen, env, secrets, zip, vector, vercel_agents

**xps.*** (21): project, intake, queue, gates, brand_pack, website_pack, templates,
assets, competitor_intel, qa, auto_fix, auto_heal, auto_harden, seo, blog, social,
payments, whatsapp, calendar, handoff, receipts

### Step 7 — Example: Read XPS project via GPT
```json
POST /api/mcp/gateway
{
  "tool_id": "ops.supabase.select",
  "execution_mode": "FULL_AUTONOMOUS",
  "caller_agent": "gpt_agent_builder",
  "input": {
    "table": "factory_projects",
    "filter": "project_id=eq.XPS-MCP-E2E-0001",
    "limit": 1
  }
}
```

### Step 8 — Example: Queue a new XPS project
```json
POST /api/mcp/xps-factory
{
  "workflow": "project",
  "step": "create",
  "execution_mode": "FULL_AUTONOMOUS",
  "caller_agent": "gpt_agent_builder",
  "input": {
    "client_name": "Phoenix Garage Floors LLC",
    "industry": "epoxy_flooring",
    "client_slug": "phoenix-garage-floors"
  }
}
```
