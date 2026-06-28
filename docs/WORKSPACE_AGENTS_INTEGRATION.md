# OpenAI ChatGPT Workspace Agents Integration

## What This Is

Your `OPENAI_API_KEY_2` is NOT a standard OpenAI platform API key.

It is an **OpenAI Workspace Agent Access Token** (`at-...` prefix).

This is a newer, separate token type that lets you programmatically trigger
**published ChatGPT workspace agents** from external systems — n8n, Vercel,
backend code, anywhere.

---

## Key Facts (from OpenAI docs, 2026)

| Property | Value |
|---|---|
| Token prefix | `at-...` |
| Base URL | `https://api.chatgpt.com` (NOT platform.openai.com) |
| Trigger endpoint | `POST /v1/workspace_agents/{agtch_XXX}/trigger` |
| Response | `202 Accepted` (async — agent runs in background) |
| Auth header | `Authorization: Bearer $OPENAI_WORKSPACE_AGENT_TOKEN` |
| Platform API keys? | NOT compatible — different system entirely |
| GPT-4o/completions? | ❌ NOT for this token — use standard `sk-...` key for that |

---

## What You Can Do With It

✅ Trigger any ChatGPT workspace agent you've built in your Business/Enterprise workspace  
✅ Send it inputs (prompts, data, task descriptions)  
✅ Use a `conversation_key` to maintain context across multiple triggers  
✅ Use `Idempotency-Key` to safely retry without duplicate runs  
✅ Integrate with n8n, Vercel crons, webhooks, any backend  

❌ Cannot retrieve the agent's response via API (coming soon per OpenAI docs)  
❌ Cannot list agents via API (must get agent ID from ChatGPT Admin UI)  

---

## Token Status

- ✅ Token is **VALID** (confirmed 2026-06-28 via 404 probe test)
- Stored as `OPENAI_WORKSPACE_AGENT_TOKEN` in AUTO_BUILDER + BUSINESS_BUILDER Vercel projects

---

## How to Get Your Agent IDs (agtch_XXX)

1. Open **chatgpt.com** → your Business workspace
2. Go to **Admin panel > Agents** (or open the agent builder)
3. Open a workspace agent you've published
4. Add or view the **API channel** — the ID appears as `agtch_XXXXXXXX`
5. Store that ID in Supabase `agent_memory` or your env vars

---

## API Route (built into AUTO_BUILDER)

### Test token readiness:
```
GET https://auto-builder-strategic-minds-advisory.vercel.app/api/workspace-agents/trigger
```

### Trigger an agent:
```bash
curl -X POST https://auto-builder-strategic-minds-advisory.vercel.app/api/workspace-agents/trigger \
  -H "Content-Type: application/json" \
  -d '{"agentId": "agtch_YOUR_AGENT_ID", "input": "Summarize today\'s leads", "conversationKey": "daily_summary_001"}'
```

---

## Integration with AUTO_BUILDER Swarm

Once you have agent IDs, you can:

1. **Route tasks to specialized ChatGPT agents** — e.g., send lead data to a
   dedicated "Lead Qualifier Agent" built in ChatGPT
2. **Bridge Base44 ↔ ChatGPT agents** — APEX triggers a ChatGPT agent,
   result comes back via webhook or n8n
3. **Automate content generation** — trigger a "Content Writer" agent with
   brief, get output via connected Google Docs action
4. **Client-facing agents** — trigger a "Client Onboarding" agent when a new
   project is created in the factory

---

## Next Steps

1. Go to chatgpt.com → your Business workspace
2. Open each workspace agent you want to trigger externally
3. Add "API" as a channel in the agent builder
4. Copy the `agtch_XXX` ID
5. Test: `POST /api/workspace-agents/trigger` with that ID
6. Store agent IDs in Supabase `agent_memory` with tag `workspace_agent_id`

---

*Documented 2026-06-28 | APEX ORCHESTRATOR*
