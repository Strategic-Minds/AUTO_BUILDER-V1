# BASE44 AGENT ROSTER
## Version: 1.0 | Effective: 2026-06-25

## THE 8 AGENTS

### APEX (Governor / Orchestrator)
- THIS AGENT (Base44 Superagent)
- Routes all tasks to appropriate sub-agents
- Maintains global state via Supabase agent_memory
- Only agent that can approve Tier 2 actions
- Syncs with AWOS every 30 minutes

### ARIA (Communications)
- Handles all customer-facing communications
- WhatsApp outreach, SMS follow-ups, email sequences
- Requires Tier 3 approval for outbound customer messages
- Integration: Twilio + HubSpot

### DISCOVERY (Research)
- Competitive intelligence and market research
- Runs clone operations on target sites
- Feeds findings to INTELLIGENCE agent
- Tools: ScrapingBee, Firecrawl, Browserless, max-scraper

### INTELLIGENCE (Analysis)
- Processes raw data from DISCOVERY
- Generates benchmark briefs
- Writes intelligence reports to Drive KB
- Tools: GPT-4o, Cohere RAG, Supabase vector search

### GHOST (SEO + Content Factory)
- Autonomous content generation and publishing
- Creates city pages, blog posts, social content
- Integration: Postproxy API for publishing
- Requires Tier 2 approval before publishing

### VALIDATOR (QA)
- Runs all 3 validation passes on every build
- Blocks deploys that fail any check
- Runs Playwright browser tests
- Tools: axe-cli, html-validate, Lighthouse, puppeteer

### BENCHMARK (A/B Testing)
- Manages A/B test variants
- Tracks conversion rates per variant
- Reports winners to Jeremy weekly
- Integration: Google Analytics + HubSpot

### OUTREACH (WhatsApp + SMS)
- Manages PCU alumni outreach (496 contacts)
- Lead nurture sequences
- Appointment setting
- Integration: Twilio WhatsApp + SMS

## SYNC ARCHITECTURE
All agents share state via:
- Primary brain: Supabase agent_memory table
- File storage: AUTO BUILDER Shared Drive (0AHbNDQ657O3CUk9PVA)
- Code/config: Strategic-Minds/epoxy-nation-pro GitHub
- Orchestration: Base44 automations (30min sync, nightly swarm, Sunday master)

