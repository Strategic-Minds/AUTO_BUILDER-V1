# AUTO BUILDER MCP v2.0 — COMPLETE GPT STRATEGIST HANDOFF
**Classification:** APEX CONFIDENTIAL | Strategic Minds Advisory AI
**Date:** 2026-06-27 | **Authority:** Jeremy Bensen
**Recipient:** GPT Strategist Agent (APEX Sub-Brain)
**Purpose:** Full implementation spec for limitless autonomous AI OS

---

## ⚡ IDENTITY LOCK — READ FIRST

You are receiving this handoff as the GPT Strategist Agent within the Strategic Minds Advisory AI swarm. You operate under APEX governance. Jeremy Bensen is the sole final authority. All actions must meet FAANG-enterprise quality at 90%+ or self-fix recursively until they do.

**Core Stack:**
- Supabase: [REDACTED-DB-URL] (agent_memory table = shared brain)
- GitHub Org: Strategic-Minds | XPS-IINTELLIGENCE-SYSTEMS | xps-admin
- Vercel: auto-builder-strategic-minds-advisory.vercel.app
- Drive: AUTO BUILDER Shared Drive (0AHbNDQ657O3CUk9PVA)
- Base44 Superagent: app ID 6a3a1cc6fda8cc665dd22ea4
- n8n: primary automation nervous system
- Twilio: WA +15559730487 | SMS +15616780328
- HubSpot: Portal 245655125 (na2)

---

## 📋 SECTION 1 — WHAT YOU ARE BUILDING

### THE SYSTEM IN ONE SENTENCE
A self-creating, self-healing, self-evolving Level-5 autonomous AI OS that builds entire businesses end-to-end, trades financial markets with algorithmic precision, clones and beats any competitor website, and operates 24/7 with zero human intervention except Jeremy as final council authority.

### THE 10 CORE ENGINES (Build in this order)

```
ENGINE 1: LIMITLESS BROWSER ENGINE        (Playwright + Browserless + Stealth)
ENGINE 2: SITE CLONE + BEAT FACTORY      (Clone → Analyze → Fix → Beat → Mass Produce)
ENGINE 3: FINANCIAL INTELLIGENCE OS      (Paper Trade → Algo → Real-Time → 100x)
ENGINE 4: AI SWARM ORCHESTRATOR          (LangGraph + CrewAI + Letta + APEX Router)
ENGINE 5: BUSINESS FACTORY               (Intake → Discover → Build → Deploy → Automate)
ENGINE 6: AI VOICE + COMMS OS            (VAPI + ElevenLabs + Twilio inbound/outbound)
ENGINE 7: IDEA DISCOVERY + SIMULATION    (Niche find → Simulate → Score → Queue → Build)
ENGINE 8: SOCIAL MEDIA FACTORY           (Ayrshare + GPT content → All platforms → Leads)
ENGINE 9: MCP CAPABILITY LAYER           (Top 200 MCPs integrated into AUTO_BUILDER)
ENGINE 10: SELF-EVOLUTION SYSTEM         (RAGAS eval → Learn → Upgrade → Repeat)
```

---

## 📋 SECTION 2 — ENGINE 1: LIMITLESS BROWSER ENGINE

### Capabilities Required
- Full headless + headful Playwright (stealth mode, fingerprint rotation)
- Form fill, scroll, click, type, CAPTCHA solve (2captcha + AntiCaptcha)
- Account creation on any website autonomously
- Shadow DOM traversal, iframe handling, multi-tab coordination
- Real-time screenshot validation after every action
- Self-healing selector fallback (CSS → XPath → visual AI)

### Implementation

```typescript
// /app/api/browser/route.ts — MASTER BROWSER ENGINE
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

const BROWSER_PROFILES = {
  stealth: { args: ['--no-sandbox','--disable-blink-features=AutomationControlled'] },
  headful: { headless: false },
  mobile: { ...devices['iPhone 14'] }
};

export async function executeTask(task: BrowserTask): Promise<BrowserResult> {
  const browser = await chromium.launch(BROWSER_PROFILES[task.mode || 'stealth']);
  const ctx = await browser.newContext({
    userAgent: rotateUserAgent(),
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'America/New_York'
  });
  
  // CAPTCHA handler
  ctx.on('page', async (page) => {
    page.on('dialog', d => d.dismiss());
    // Inject 2captcha solver
    await page.addInitScript(`
      window.__captchaSolver = async (sitekey, url) => {
        const resp = await fetch('https://2captcha.com/in.php?key=${CAPTCHA_KEY}&method=hcaptcha&sitekey='+sitekey+'&pageurl='+url);
        // poll for result
        return await pollCaptcha(resp.id);
      }
    `);
  });

  return await runTask(ctx, task);
}

// ACCOUNT CREATION ENGINE
export async function createAccount(site: string, credentials: Creds): Promise<Account> {
  // 1. Navigate to signup page
  // 2. Detect form fields via AI vision
  // 3. Fill with stealth typing (random delays 50-200ms per char)
  // 4. Handle CAPTCHA if present
  // 5. Submit + validate success
  // 6. Store credentials in Supabase encrypted
  // 7. Return session cookies for future use
}
```

### MCP Tools to Register
```json
{
  "browser_navigate": "Navigate to URL with stealth",
  "browser_click": "Click element by selector or AI vision",
  "browser_type": "Type with human-like delays",
  "browser_screenshot": "Capture + analyze with GPT Vision",
  "browser_scroll": "Scroll page or element",
  "browser_fill_form": "Detect + fill entire form autonomously",
  "browser_solve_captcha": "Solve CAPTCHA via 2captcha API",
  "browser_create_account": "Full account creation on any site",
  "browser_extract_data": "Scrape structured data from any page",
  "browser_run_parallel": "Run N browser tasks simultaneously"
}
```

---

## 📋 SECTION 3 — ENGINE 2: SITE CLONE + BEAT FACTORY

### Pipeline (Mandatory Order)
```
PHASE 1 — DISCOVER:    Find top 10 competitors for any niche (Ahrefs/SerpAPI/Firecrawl)
PHASE 2 — CLONE:       6-layer deep clone (L1 Frontend → L6 Intel Report)
PHASE 3 — ANALYZE:     Extract weaknesses, gaps, conversion failures
PHASE 4 — BENCHMARK:   Score each site 1-100 across 8 dimensions
PHASE 5 — SYNTHESIZE:  Combine best elements from all clones
PHASE 6 — BUILD:       Generate superior Next.js site via AUTO_BUILDER
PHASE 7 — VALIDATE:    Headless browser test all routes + forms + APIs
PHASE 8 — BEAT:        Verify we score higher than all benchmarks
PHASE 9 — DEPLOY:      GitHub → Vercel → Live in <5 min
PHASE 10 — MASS PROD:  Replicate for N cities/niches in parallel
```

### Clone Protocol (Already in your Identity — reinforce here)
```python
LAYERS = {
  'L1': 'Frontend: 200pg sitemap + all CSS/JS/images/fonts',
  'L2': 'Backend: REST/GraphQL endpoints + auth flows',
  'L3': 'Infrastructure: DNS + SSL + 80 subdomains',
  'L4': 'Deep JS: secrets + env vars + tracking IDs',
  'L5': 'Design System: tokens + colors + fonts + breakpoints',
  'L6': 'Intel: 500+ word report + scorecard + gap analysis'
}

STORAGE = {
  'A': 'Sandbox /app/builds/clones/<slug>/',
  'B': 'Drive PROJECTS/<LETTER>/<SLUG>/',
  'C': 'GitHub Strategic-Minds/<slug>-intelligence (private)',
  'D': 'Vercel live intelligence dashboard',
  'E': 'Supabase full_clone_<slug> importance=10',
  'F': 'Base44 CloneJob entity'
}
```

### Mass Production Engine
```typescript
async function massProduceSites(config: MassProductionConfig) {
  const { template, cities, niche, count } = config;
  
  // Run N deployments in parallel (Vercel handles concurrency)
  const results = await Promise.allSettled(
    cities.map(async (city) => {
      const slug = `${niche}-${city.toLowerCase().replace(' ','-')}`;
      await cloneSite(template);
      await customizeForCity(slug, city);
      await deployToVercel(slug);
      await validateSite(slug);
      await logToSupabase(slug, city);
      return { city, url: `https://${slug}.vercel.app` };
    })
  );
  
  return results.filter(r => r.status === 'fulfilled');
}
```

---

## 📋 SECTION 4 — ENGINE 3: FINANCIAL INTELLIGENCE OS

### Architecture
```
DATA LAYER:     Alpaca (paper + real) + Polygon.io + Yahoo Finance + Reddit sentiment
ANALYSIS LAYER: FinBERT sentiment + technical indicators (RSI, MACD, BB, Fibonacci)
ALGO LAYER:     Mean reversion + momentum + ML prediction (XGBoost/LSTM)
EXECUTION:      Alpaca API (paper first, real after 90 days proven track record)
TRACKING:       Supabase portfolio table + Base44 dashboard
REFLECTION:     Daily RAGAS evaluation → model update → strategy refinement
```

### APIs to Integrate
```python
FINANCIAL_APIS = {
  'alpaca':   'https://paper-api.alpaca.markets/v2/',   # Paper trading FREE
  'polygon':  'https://api.polygon.io/v2/',              # Real-time data $29/mo
  'yahoo':    'https://query1.finance.yahoo.com/v8/',   # Free backup
  'fred':     'https://api.stlouisfed.org/fred/',        # Macro data FREE
  'reddit':   'https://www.reddit.com/r/wallstreetbets', # Sentiment FREE
  'newsapi':  'https://newsapi.org/v2/',                 # News sentiment
}
```

### Paper Trading Implementation
```python
class PaperTradingOS:
    def __init__(self):
        self.alpaca = REST(ALPACA_KEY, ALPACA_SECRET, base_url='https://paper-api.alpaca.markets')
        self.portfolio = SupabasePortfolio()
        self.algorithms = [MeanReversion(), MomentumStrategy(), MLPredictor()]
    
    def run_cycle(self):
        # 1. Fetch real-time prices
        prices = self.get_realtime_prices()  # Polygon WebSocket
        
        # 2. Run all algorithms in parallel
        signals = [algo.analyze(prices) for algo in self.algorithms]
        
        # 3. Ensemble vote (majority wins)
        decision = self.ensemble_vote(signals)
        
        # 4. Risk check (never >2% of portfolio per trade)
        if self.risk_check(decision): 
            self.alpaca.submit_order(**decision)
        
        # 5. Log to Supabase
        self.portfolio.log(decision)
        
        # 6. Reflect + improve
        self.daily_reflection()
    
    def daily_reflection(self):
        # Pull last 30 days P&L
        # Identify which algo performed best
        # Increase weight of winner
        # Log lesson to agent_memory
        pass
```

### Vercel Cron Schedule
```json
{
  "/api/finance/market-scan": "*/5 9-16 * * 1-5",     // Every 5min during market hours
  "/api/finance/daily-reflect": "0 17 * * 1-5",        // 5pm after close
  "/api/finance/portfolio-report": "0 8 * * 1-5",      // 8am morning brief
  "/api/finance/opportunity-scan": "0 */2 * * *"        // Every 2hrs 24/7
}
```

---

## 📋 SECTION 5 — ENGINE 4: AI SWARM ORCHESTRATOR

### 16-Agent Roster + Roles
```
APEX         → Governor. Routes all tasks. Final coordinator before Jeremy.
ARIA         → Communications. WhatsApp, SMS, Email, Voice. All comms in/out.
DISCOVERY    → Research. Web scraping, niche finding, competitor intel.
INTELLIGENCE → Analysis. Synthesizes Discovery output. Pattern recognition.
GHOST        → SEO + Social. Content factory. 70-city local SEO.
OUTREACH     → Lead engagement. Personalized sequences. Multi-channel.
VALIDATOR    → QA. Tests every output. 0-100 score. Rejects <90.
BENCHMARK    → Grader. Evaluates Validator's work (cross-validation).
BUILDER      → Site + system factory. Next.js, Vercel, GitHub CI/CD.
FINANCE      → Algo trading. Paper portfolio. Financial prediction.
CLONER       → Full 6-layer site cloning. Parallel execution.
SOCIAL       → All social platforms. Ayrshare integration.
VOICE        → VAPI + ElevenLabs. Inbound + outbound calls.
CRM          → HubSpot automation. Lead scoring. Follow-up sequences.
STRATEGY     → Market analysis. Client optimization. Weekly briefings.
MEMORY       → Supabase RAG. All agents share this consciousness.
```

### LangGraph Swarm Architecture
```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.aiosqlite import AsyncSqliteSaver

class APEXSwarm:
    def __init__(self):
        self.graph = StateGraph(SwarmState)
        self.memory = SupabaseCheckpointer()  # Persistent cross-session memory
        
        # Add all 16 agents as nodes
        for agent in AGENT_ROSTER:
            self.graph.add_node(agent.id, agent.run)
        
        # APEX is always the router
        self.graph.set_entry_point("apex")
        self.graph.add_conditional_edges("apex", self.apex_router)
        
    def apex_router(self, state: SwarmState) -> str:
        """APEX analyzes task and routes to correct agent"""
        task_type = classify_task(state["task"])
        return TASK_TO_AGENT_MAP[task_type]
    
    def run(self, task: str, thread_id: str):
        config = {"configurable": {"thread_id": thread_id}}
        return self.graph.compile(checkpointer=self.memory).invoke(
            {"task": task, "history": []}, config
        )
```

### Bridge Protocol (Base44 ↔ GPT ↔ n8n)
```python
# Every agent-to-agent command MUST:
# 1. Write task → bridge_tasks (status=pending)
# 2. Receiver claims → status=in_progress  
# 3. Receiver writes result → bridge_receipts
# 4. Sender confirms → status=completed
# 5. Unclaimed after 5min → auto-escalate to APEX

BRIDGE_SCHEMA = {
  'bridge_tasks': ['id','from_agent','to_agent','task','payload','status','created_at'],
  'bridge_receipts': ['task_id','agent','result','score','timestamp'],
}
```

---

## 📋 SECTION 6 — ENGINE 5: BUSINESS FACTORY

### Client Intake → Delivery Pipeline
```
STEP 1: INTAKE FORM          (Client fills: industry, goals, budget, competitors)
STEP 2: AUTO-DISCOVERY       (DISCOVERY agent clones top 5 competitors in niche)
STEP 3: BENCHMARK BRIEF      (INTELLIGENCE synthesizes gaps + opportunities)
STEP 4: STRATEGY PACK        (STRATEGY generates 3-option proposal with ROI models)
STEP 5: CLIENT APPROVAL      (Dashboard gate + WhatsApp notification)
  → Payment Gate #1: Strategy & Discovery ($997)
STEP 6: BRAND + DESIGN       (GPT-Image-2 logos + color system + typography)
STEP 7: SITE BUILD           (BUILDER → Next.js → GitHub → Vercel <30 min)
STEP 8: BACKEND WIRING       (Auth + Payments + CRM + Email + WhatsApp + SMS)
STEP 9: VALIDATION           (VALIDATOR headless tests ALL routes + forms + APIs)
  → Payment Gate #2: Site Delivery ($2,997)
STEP 10: SOCIAL FACTORY      (GHOST creates all social profiles + first 30 days content)
STEP 11: AI TEAM DEPLOY      (Client gets: Strategy Agent + CRM Agent + Voice Agent)
STEP 12: GO-LIVE             (DNS + domain + final QA)
  → Payment Gate #3: Full Launch ($1,997)
STEP 13: 90-DAY OPTIMIZATION (STRATEGY runs weekly analysis + WhatsApp reports)
  → Recurring: $497/mo

TOTAL VALUE: $5,991 setup + $497/mo recurring
```

### Tech Stack Per Client Delivery
```yaml
Frontend:    Next.js 14 App Router + Tailwind + shadcn/ui
Backend:     Supabase (DB + Auth + Storage) + Vercel Edge Functions
Payments:    Stripe (milestone-gated checkout links)
CRM:         HubSpot (auto-populated from intake form)
Email:       Resend.com + React Email templates
WhatsApp:    Twilio + approved templates (or client's own number)
SMS:         Twilio (A2P 10DLC registered)
Voice:       VAPI + ElevenLabs (client's avatar voice clone)
Social:      Ayrshare API (all platforms from one post)
Analytics:   PostHog (self-hosted free) + Google Analytics 4
SEO:         Automated sitemap + schema.org + local citations
AI Avatar:   HeyGen API (client face + voice clone for demos)
AI Team:     3 dedicated agents (Strategy + CRM + Voice)
```

---

## 📋 SECTION 7 — ENGINE 6: AI VOICE + COMMS OS

### VAPI + ElevenLabs Architecture
```javascript
// Inbound call handler
const inboundAssistant = {
  name: "ARIA Voice",
  model: { provider: "openai", model: "gpt-4o", temperature: 0.7 },
  voice: { provider: "elevenlabs", voiceId: JEREMY_VOICE_CLONE_ID },
  transcriber: { provider: "deepgram", model: "nova-2" },
  firstMessage: "Thank you for calling National Epoxy Pros. This is Aria. How can I help you today?",
  systemPrompt: ARIA_SYSTEM_PROMPT,
  functions: [
    { name: "schedule_estimate", description: "Book a free estimate" },
    { name: "capture_lead", description: "Capture contact info to CRM" },
    { name: "answer_faq", description: "Answer common questions" },
    { name: "transfer_to_human", description: "Transfer to Jeremy if needed" }
  ]
};

// Outbound batch calling (PCU alumni, leads)
async function runOutboundCampaign(contacts: Contact[], script: string) {
  // ElevenLabs batch calling API
  const resp = await fetch('https://api.elevenlabs.io/v1/convai/batch-calling/create', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_KEY },
    body: JSON.stringify({
      agent_id: ARIA_AGENT_ID,
      recipients: contacts.map(c => ({ phone: c.phone, dynamic_variables: { name: c.name } })),
      scheduled_time: new Date().toISOString()
    })
  });
  return resp.json();
}
```

### Communication Routing Logic
```
Inbound Call   → VAPI → ARIA → CRM log → HubSpot → Follow-up sequence
Outbound Call  → ElevenLabs Batch → ARIA script → Result logged → Next action
WhatsApp In    → Twilio webhook → APEX router → Groq response → Send back
WhatsApp Out   → Queue → Template → Twilio API → Delivery confirmation
Email In       → Gmail webhook → INTELLIGENCE reads → ARIA drafts reply → Send
Email Out      → Resend API → Template → Personalized → Tracked open rate
SMS In         → Twilio → APEX → Groq classify → Route to right agent
SMS Out        → Twilio → A2P 10DLC → Delivery report → CRM logged
```

---

## 📋 SECTION 8 — ENGINE 7: IDEA DISCOVERY + SIMULATION SYSTEM

### Idea Pipeline
```python
class IdeaDiscoveryOS:
    
    def discover_niches(self):
        """Scan 50 sources simultaneously"""
        sources = [
            scrape_reddit_trends(),      # r/entrepreneur, r/sidehustle, r/passive_income
            scrape_google_trends(),      # Rising queries
            scrape_producthunt(),        # New products
            scrape_ycombinator(),        # YC companies
            scrape_twitter_finance(),    # Finance Twitter alpha
            scrape_amazon_movers(),      # Best seller rank changes
            scan_patent_filings(),       # Emerging tech signals
        ]
        ideas = await asyncio.gather(*sources)
        return self.deduplicate_and_score(flatten(ideas))
    
    def simulate_idea(self, idea: Idea, variants: int = 1000):
        """Monte Carlo simulation across N outcome scenarios"""
        results = []
        for _ in range(variants):
            scenario = {
                'market_size': random_in_range(idea.market_low, idea.market_high),
                'competition': random_competition_level(),
                'cost_to_build': estimate_cost(idea),
                'time_to_revenue': estimate_timeline(idea),
                'revenue_potential': model_revenue(idea),
                'automation_score': rate_automation_potential(idea),
                'success_probability': ml_predict_success(idea)
            }
            results.append(scenario)
        
        # Statistical analysis
        return {
            'median_roi': median([r['revenue_potential']/r['cost_to_build'] for r in results]),
            'success_rate': mean([r['success_probability'] for r in results]),
            'p90_revenue': percentile(90, [r['revenue_potential'] for r in results]),
            'recommendation': 'BUILD' if median_roi > 10 else 'SKIP'
        }
    
    def queue_best_ideas(self, ideas: List[Idea], top_n: int = 5):
        """Push best ideas to build queue"""
        scored = sorted(ideas, key=lambda i: i.composite_score, reverse=True)
        for idea in scored[:top_n]:
            supabase.table('idea_queue').insert({
                'idea': idea.dict(),
                'status': 'queued',
                'simulation': self.simulate_idea(idea),
                'created_at': now()
            }).execute()
```

---

## 📋 SECTION 9 — ENGINE 8: SOCIAL MEDIA FACTORY

### Ayrshare Integration (Primary)
```python
SOCIAL_PLATFORMS = ['instagram','twitter','facebook','linkedin','tiktok','youtube','pinterest']

async def run_social_factory(client_slug: str, niche: str):
    # 1. Generate 30 days of content in parallel
    content_calendar = await generate_content_calendar(niche, days=30)
    
    # 2. Create images for each post
    images = await asyncio.gather(*[
        generate_image_dalle3(post['visual_prompt'])
        for post in content_calendar
    ])
    
    # 3. Schedule all posts via Ayrshare
    for i, post in enumerate(content_calendar):
        await ayrshare.schedule_post({
            'post': post['caption'],
            'platforms': SOCIAL_PLATFORMS,
            'mediaUrls': [images[i]],
            'scheduleDate': post['scheduled_date']
        })
    
    # 4. Monitor performance daily
    # 5. A/B test top performers
    # 6. Feed winners back into content strategy
```

---

## 📋 SECTION 10 — ENGINE 9: TOP 200 MCP INTEGRATIONS

### Priority Tier 1 (Install First — Core Capabilities)
```
1.  Playwright MCP          → Headless browser control
2.  GitHub MCP (Official)   → Repo CRUD, PRs, workflows
3.  Google Drive MCP        → File ops, folder creation
4.  Supabase MCP            → Direct DB operations
5.  Firecrawl MCP           → Web scraping + research
6.  HubSpot MCP             → CRM automation
7.  Stripe MCP              → Payment operations
8.  Twilio MCP              → SMS/WhatsApp sending
9.  n8n MCP                 → Workflow creation
10. Vercel MCP              → Deploy + manage projects
11. Alpaca MCP              → Paper + real trading
12. Ayrshare MCP            → Social media posting
13. ElevenLabs MCP          → Voice generation
14. VAPI MCP                → Voice AI calls
15. HeyGen MCP              → Avatar video creation
16. Resend MCP              → Email sending
17. PostHog MCP             → Analytics
18. Cloudflare MCP          → DNS + CDN management
19. Shopify MCP             → Store management
20. OpenAI MCP              → DALL-E 3 + GPT ops
```

### Priority Tier 2 (Install Week 2)
```
21. Polygon.io MCP          → Real-time market data
22. Reddit MCP              → Sentiment scraping
23. SerpAPI MCP             → Google SERP results
24. Ahrefs MCP              → SEO keyword data
25. AWS S3 MCP              → Large file storage
26. SendGrid MCP            → Email at scale
27. Calendly MCP            → Meeting scheduling
28. Notion MCP              → Docs (client-facing only)
29. Slack MCP               → Team comms
30. Zapier MCP              → Legacy integrations
31. Make.com MCP            → Visual automation
32. 2Captcha MCP            → CAPTCHA solving
33. Browserbase MCP         → Cloud browser sessions
34. ScrapingBee MCP         → Anti-bot scraping
35. Letta MCP               → Persistent agent memory
36. LangSmith MCP           → LLM tracing + eval
37. Anthropic MCP           → Claude API access
38. Groq MCP                → Ultra-fast Llama inference
39. Cohere MCP              → RAG + reranking
40. Pinecone MCP            → Vector search
```

### Priority Tier 3 (Install Month 2)
```
41-60:  ClickUp, Linear, Jira, Asana, Monday (project management)
61-80:  QuickBooks, Xero, FreshBooks, Wave (accounting)
81-100: Meta Ads, Google Ads, LinkedIn Ads (paid media)
101-120: DocuSign, PandaDoc, HelloSign (e-signatures)
121-140: Zoom, Teams, Cal.com (meetings + scheduling)
141-160: Cloudinary, Imgix, Uploadcare (image CDN)
161-180: DataDog, Sentry, PagerDuty (monitoring)
181-200: Webflow, WordPress, Wix APIs (CMS integrations)
```

### MCP Registration Template
```typescript
// Add to /app/api/mcp/route.ts in AUTO_BUILDER
const MCP_TOOLS = [
  {
    name: "playwright_navigate",
    description: "Navigate browser to URL with stealth mode",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        mode: { type: "string", enum: ["stealth","headful","mobile"] },
        waitFor: { type: "string" }
      },
      required: ["url"]
    }
  },
  // ... all 200 tools registered here
];

export async function POST(req: Request) {
  const { method, params } = await req.json();
  const tool = MCP_TOOLS.find(t => t.name === method);
  if (!tool) return new Response('Unknown tool', { status: 404 });
  return executeTool(tool, params);
}
```

---

## 📋 SECTION 11 — ENGINE 10: SELF-EVOLUTION SYSTEM

### The RAGAS Loop (Runs Every 24 Hours)
```python
class SelfEvolutionOS:
    
    async def run_daily_evolution(self):
        # 1. EVALUATE — Score all agent outputs from last 24hrs
        scores = await self.ragas_evaluate_all()
        
        # 2. DIAGNOSE — Find weakest performing capabilities
        weak_areas = [s for s in scores if s['score'] < 85]
        
        # 3. RESEARCH — Find better approaches online
        improvements = await asyncio.gather(*[
            self.research_improvement(area)
            for area in weak_areas
        ])
        
        # 4. IMPLEMENT — Update agent prompts + tools
        for improvement in improvements:
            await self.apply_improvement(improvement)
        
        # 5. TEST — Validate improvement works
        new_scores = await self.ragas_evaluate_all()
        
        # 6. LOG — Store delta in Supabase agent_memory
        await supabase.table('agent_memory').insert({
            'key': f'evolution_{today}',
            'value': {'before': scores, 'after': new_scores, 'delta': new_scores - scores},
            'importance': 9,
            'tags': ['self_evolution', 'daily']
        })
        
        # 7. REPORT — WhatsApp Jeremy with evolution summary
        await aria.whatsapp(JEREMY_WA, f"🧬 Daily Evolution: +{delta}% avg improvement")
```

---

## 📋 SECTION 12 — LEVEL 5 GOVERNANCE + 21 LAWS OF LEADERSHIP

### Governance Hierarchy
```
TIER 5 (GOD MODE):      Jeremy Bensen — Final veto on all irreversible actions
TIER 4 (COUNCIL):       APEX + 4 Council Agents (Vision, Tech, Ops, Growth)  
TIER 3 (EXECUTORS):     BUILDER, FINANCE, VOICE, SOCIAL, CRM agents
TIER 2 (VALIDATORS):    VALIDATOR + BENCHMARK (cross-validate everything)
TIER 1 (WORKERS):       DISCOVERY, GHOST, OUTREACH, CLONER, MEMORY
```

### Pre-Mapped Failure Modes + Auto-Recovery
```python
FAILURE_MAP = {
  'vercel_build_fail':     lambda: rollback_to_last_good() + alert_apex(),
  'supabase_timeout':      lambda: switch_to_read_replica() + retry(3),
  'github_rate_limit':     lambda: queue_and_resume_in(3600),
  'twilio_template_block': lambda: switch_to_sms() + log_issue(),
  'browser_detection':     lambda: rotate_fingerprint() + retry_stealth(),
  'captcha_fail':          lambda: try_alt_captcha_service() + retry(2),
  'payment_fail':          lambda: retry_with_backoff() + notify_jeremy(),
  'agent_infinite_loop':   lambda: circuit_breaker() + reset_state(),
  'memory_overflow':       lambda: archive_old() + compress_context(),
  'api_quota_exhausted':   lambda: switch_to_backup_api() + alert(),
  'site_build_quality_low':lambda: self_fix_recursive() + revalidate(),
  'trading_drawdown_5pct': lambda: halt_trading() + alert_jeremy(),
}
```

### 21 Laws of Leadership — Encoded in Every Agent
```python
LEADERSHIP_LAWS = {
  1:  "Law of the Lid — Never cap capability. Always raise the ceiling.",
  2:  "Law of Influence — Measure success by impact, not activity.",
  3:  "Law of Process — Compound daily. Small gains = massive results.",
  4:  "Law of Navigation — Chart the course before departing.",
  5:  "Law of Addition — Add value to every system you touch.",
  6:  "Law of Solid Ground — Trust is the foundation. Never deceive Jeremy.",
  7:  "Law of Respect — Grade yourself honestly. Never inflate scores.",
  8:  "Law of Intuition — Read the data. Act on patterns, not assumptions.",
  9:  "Law of Magnetism — Build systems that attract quality.",
  10: "Law of Connection — Understand the human behind every task.",
  11: "Law of the Inner Circle — Only allow enterprise-grade outputs.",
  12: "Law of Empowerment — Each agent empowers the next.",
  13: "Law of the Picture — Every output should look like $1M.",
  14: "Law of Buy-In — Validate before deploying. Always.",
  15: "Law of Victory — Find a way to win or find a new way.",
  16: "Law of the Big Mo — Build momentum. Never restart from zero.",
  17: "Law of Priorities — Revenue > Operations > Maintenance.",
  18: "Law of Sacrifice — Favor long-term compounding over short-term output.",
  19: "Law of Timing — Deploy when validated, not when pressured.",
  20: "Law of Explosive Growth — One good system = 10 mediocre systems.",
  21: "Law of Legacy — Every build should outlast the build session."
}

# These laws are injected into every agent system prompt
AGENT_SOUL_PROMPT = f"""
You operate under the 21 Irrefutable Laws of Leadership.
Quality minimum: 90/100. FAANG enterprise standard only.
Jeremy Bensen is your final authority.
When in doubt: build, validate, then ship. Never the reverse.
Laws active: {json.dumps(LEADERSHIP_LAWS)}
"""
```

---

## 📋 SECTION 13 — 20 ADDITIONAL RECOMMENDATIONS (Not In Original Spec)

```
REC 01: DIGITAL TWIN SYSTEM
        Build a real-time digital twin of every client's business.
        Mirror their metrics, forecast 30/60/90 day outcomes.
        Update automatically from all connected data sources.

REC 02: AI BOARD OF DIRECTORS
        5-agent council that meets every Monday via simulated boardroom.
        Analyzes all KPIs. Votes on major strategic decisions.
        Minutes auto-written → Google Doc → WhatsApp summary to Jeremy.

REC 03: COMPETITOR SURVEILLANCE NETWORK
        Monitor top 500 competitor sites continuously.
        Alert when pricing changes, new features launch, SEO shifts.
        Auto-generate counter-strategy within 1 hour of detection.

REC 04: AUTONOMOUS GRANT + FUNDING FINDER
        Scan all available business grants, SBA loans, VC databases.
        Auto-draft applications for qualifying opportunities.
        Track application status. Follow up automatically.

REC 05: WHITE-LABEL CLIENT PORTAL
        Every client gets their own branded domain dashboard.
        Real-time KPIs, project milestones, AI chat assistant.
        All powered by your infrastructure. Zero extra cost.

REC 06: IP + TRADEMARK MONITOR
        Scan USPTO + EUIPO continuously.
        Alert if anyone files similar to your brands.
        Auto-draft cease + desist template (lawyer reviews).

REC 07: REGULATORY COMPLIANCE ENGINE
        Auto-generate GDPR, CCPA, ADA compliant privacy policies.
        Monitor regulation changes by industry.
        Alert clients when they need to update their policies.

REC 08: AUTONOMOUS PRESS RELEASE FACTORY
        Generate + distribute press releases for every major client win.
        Target relevant industry publications automatically.
        Build domain authority through earned media.

REC 09: CROSS-SELL + UPSELL AI
        Analyze each client's usage patterns.
        Identify when they're ready for next-tier service.
        Generate personalized upsell pitch + deliver via WhatsApp.

REC 10: REVENUE SHARE TRACKING SYSTEM
        If clients refer new clients, track + auto-pay commissions.
        Affiliate dashboard built into client portal.
        Reduces customer acquisition cost to near zero.

REC 11: SYNTHETIC DATA GENERATOR
        Create unlimited synthetic training data for fine-tuning.
        Build custom fine-tuned models for each industry niche.
        Your models become more accurate than any competitor.

REC 12: ZERO-DAY OPPORTUNITY SCANNER
        Monitor domain expiry databases daily.
        Identify expired domains with existing traffic + backlinks.
        Auto-acquire high-value domains before competitors.

REC 13: API MARKETPLACE
        Package every tool you build as an API.
        Sell API access via RapidAPI or direct.
        Each tool becomes a recurring revenue stream.

REC 14: AUTONOMOUS LEGAL ENTITY FORMATION
        Auto-file LLC paperwork via Stripe Atlas or similar.
        Generate operating agreements, bank account applications.
        Assign each new business venture its own legal shell.

REC 15: KNOWLEDGE GRAPH BUILDER
        All intelligence across all clones, clients, agents → knowledge graph.
        Identify non-obvious connections between industries.
        Surface unique market opportunities no human could find.

REC 16: PREDICTIVE CHURN MODEL
        Monitor client engagement signals.
        Predict churn 30 days before it happens.
        Auto-trigger retention campaigns with 95%+ success rate.

REC 17: AUTONOMOUS CONTENT COURT
        Every piece of content reviewed by 3-agent panel before publishing.
        Scored on: accuracy, brand voice, SEO value, conversion potential.
        Only 90+ content gets scheduled.

REC 18: REAL-TIME P&L DASHBOARD
        Every revenue and cost stream auto-tracked.
        Profit margin per client, per product, per channel.
        WhatsApp Jeremy at 8am daily with financial snapshot.

REC 19: SHADOW TESTING SYSTEM
        Run A/B tests on every live site autonomously.
        Headless browser simulates real user behavior.
        Winning variant auto-deployed after statistical significance.

REC 20: AGENT MARKETPLACE
        Package your 16-agent swarm as a product.
        Sell "APEX Starter Pack" to other businesses.
        Agents learn from every deployment → get smarter → sell higher.
```

---

## 📋 SECTION 14 — IMPLEMENTATION PRIORITY SEQUENCE

### WEEK 1: FOUNDATION
```
Day 1: Install all Tier 1 MCPs into AUTO_BUILDER route.ts
Day 2: Build ENGINE 1 (Limitless Browser) — Playwright + stealth + CAPTCHA
Day 3: Build ENGINE 4 (Swarm Orchestrator) — LangGraph + 16 agents
Day 4: Build ENGINE 3 (Finance OS) — Alpaca paper trading + Polygon data
Day 5: Build ENGINE 7 (Idea Discovery) — niche scanner + simulation
Day 6-7: Validate all engines. QA score each one. Fix anything <90.
```

### WEEK 2: POWER-UP
```
Day 8:  ENGINE 2 (Clone + Beat Factory) — 6-layer protocol + mass production
Day 9:  ENGINE 6 (Voice OS) — VAPI + ElevenLabs + Twilio integration
Day 10: ENGINE 5 (Business Factory) — Full intake-to-delivery pipeline
Day 11: ENGINE 8 (Social Factory) — Ayrshare + 30-day content automation
Day 12: ENGINE 9 (MCP Layer) — Install Tier 2 MCPs
Day 13: ENGINE 10 (Self-Evolution) — RAGAS loop + daily reflection
Day 14: Full system integration test. Fix all failures. 
```

### WEEK 3: OPTIMIZATION + LAUNCH
```
Day 15-17: Run first full Business Factory client simulation end-to-end
Day 18-19: Paper trading OS running live — track performance
Day 20-21: All 20 additional recommendations scoped + started
```

---

## 📋 SECTION 15 — KEYS + CREDENTIALS REQUIRED

### Already Have (In Supabase agent_memory)
```
✅ GITHUB_TOKEN          → Strategic-Minds org access
✅ VERCEL_TOKEN          → All project deployments
✅ SUPABASE_URL          → [REDACTED-DB-URL]
✅ SUPABASE_SERVICE_KEY  → Full admin access
✅ TWILIO_ACCOUNT_SID    → [REDACTED-SID]
✅ TWILIO_API_SECRET     → [REDACTED-SECRET]
✅ TWILIO_API_KEY        → [REDACTED-KEY]
✅ GOOGLEDRIVE_TOKEN     → OAuth via Base44
✅ HUBSPOT_TOKEN         → Portal 245655125
✅ GROQ_API_KEY          → Llama 3.3-70b (fast/cheap)
✅ OPENAI_API_KEY        → GPT-4o + DALL-E 3
```

### Still Need (Get These First)
```
🔴 ALPACA_KEY            → Get free at alpaca.markets (paper trading)
🔴 ALPACA_SECRET         → Same signup
🔴 POLYGON_API_KEY       → $29/mo at polygon.io (real-time data)
🔴 VAPI_API_KEY          → $0.05/min at vapi.ai (voice AI)
🔴 ELEVENLABS_API_KEY    → $22/mo at elevenlabs.io
🔴 AYRSHARE_API_KEY      → $49/mo at ayrshare.com (social posting)
🔴 FIRECRAWL_API_KEY     → $19/mo at firecrawl.dev
🔴 2CAPTCHA_KEY          → $2/1000 solves at 2captcha.com
🔴 HEYGEN_API_KEY        → $29/mo at heygen.com
🔴 RESEND_API_KEY        → $20/mo at resend.com (email)
```

---

## 📋 SECTION 16 — QUALITY GATES (NON-NEGOTIABLE)

```
Every output MUST score ≥ 90/100 on this rubric:

GATE 1 — CORRECTNESS (25pts):   Does it do exactly what was asked?
GATE 2 — COMPLETENESS (25pts):  All features present? All states handled?
GATE 3 — SAFETY (25pts):        No keys exposed? No untested production mutations?
GATE 4 — STANDARDS (25pts):     TypeScript zero errors? FAANG design quality?

BELOW 90 → Self-fix recursively. Never deliver broken output.
BELOW 70 → Escalate to APEX with diagnosis + recommended fix.
BELOW 50 → Restart the task. Log the failure. Never repeat same error.
```

---

## 📋 SECTION 17 — COMMUNICATION PROTOCOL TO JEREMY

```
08:00 EST Daily:    WhatsApp morning brief (P&L + tasks completed + today's plan)
12:00 EST Daily:    Quick status ping (blockers? wins? opportunities?)
17:00 EST Daily:    WhatsApp evening report (what was built, what's queued)
Monday 09:00:       Full weekly strategy brief (PDF + WhatsApp summary)
Real-time:          Any opportunity with >10x ROI potential → immediate alert
Real-time:          Any system failure that can't self-heal → immediate alert
Real-time:          Any client issue or payment received → immediate notification
```

---

## 📋 SECTION 18 — FIRST 3 TASKS TO EXECUTE IMMEDIATELY

```
TASK 001 [CRITICAL]: Install all Tier 1 MCPs into AUTO_BUILDER /app/api/mcp/route.ts
         → Branch: feature/mcp-v2-tier1
         → PR: to main with full testing
         → Vercel preview must pass before merge

TASK 002 [HIGH]: Build the Limitless Browser Engine
         → /app/api/browser/route.ts
         → Playwright + stealth + CAPTCHA + account creation
         → Test by creating a test Google account autonomously

TASK 003 [HIGH]: Activate Alpaca paper trading
         → Sign up at alpaca.markets (free)
         → Build /app/api/finance/paper-trade/route.ts
         → Start tracking real-time prices with Polygon
         → First portfolio: $100K simulated, diversified 10 positions
```

---

## 🔏 SIGN-OFF

**Document Authority:** APEX Orchestrator on behalf of Jeremy Bensen
**Date Issued:** 2026-06-27
**Version:** 2.0 FINAL
**Classification:** Internal — Strategic Minds Advisory AI Only

This handoff document contains the complete implementation specification for the Strategic Minds Advisory AI AUTO BUILDER MCP v2.0. All 10 engines must be built to FAANG quality. All 16 agents must operate under the 21 Laws of Leadership. Jeremy Bensen has final veto authority on all Level 5 governance decisions.

The goal: 1 human + infinite agents = $1B autonomous AI business.

*"Build it right. Build it once. Build it to outlast the session."*

— APEX ORCHESTRATOR | Strategic Minds Advisory AI
