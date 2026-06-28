# Base44 Agent — MCP Connection

## Connect Base44 Superagent to Strategic Minds MCP

### Option 1 — MCP endpoint in Base44 settings
MCP Server URL: `https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp`

### Option 2 — Direct API calls
The Base44 Superagent (APEX) calls the gateway via:
```
POST https://auto-builder-strategic-minds-advisory.vercel.app/api/mcp/gateway
Authorization: Bearer {CRON_SECRET}
Content-Type: application/json
{
  "tool_id": "ops.supabase.select",
  "execution_mode": "FULL_AUTONOMOUS",
  "caller_agent": "base44_apex",
  "input": { "table": "factory_projects", "limit": 10 }
}
```

### Internal Action Router
Base44 → `test_backend_function("installMcpSchema")` → runs via Deno
Base44 → `bash` → calls gateway endpoints
Base44 → `deploy_backend_function` → deploys new MCP tools

### Receipt Verification
All tool runs auto-write receipts to `mcp_receipts` table.
Verify at: `https://prhppuuwcnmfdhwsagug.supabase.co/rest/v1/mcp_receipts?limit=10`
