# BASE44 TOOL STACK
## Version: 1.0 | Effective: 2026-06-25

## LIVE TOOLS (all configured + tested)

### SCRAPING + BYPASS
| Tool | Key | Capability |
|------|-----|------------|
| ScrapingBee | SCRAPINGBEE_API_KEY ✅ | Cloudflare/Akamai/DataDome bypass, residential IPs |
| Firecrawl | FIRECRAWL_API_KEY ⚠️ (needs regen) | AI-ready markdown extraction, site crawls |
| Browserless | BROWSERLESS_API_KEY ✅ | Real Chrome CDP, screenshots, unfingerprinted |

### LOCAL TOOLS (installed + verified)
| Tool | Version | Capability |
|------|---------|------------|
| mitmproxy | 11.0.2 | HTTP/S traffic interception |
| three.js | 0.185.0 | WebGL source cross-reference |
| wabt | 1.0.39 | WebAssembly decompiler (.wasm → WAT) |
| puppeteer | 24.43.1 | Chrome DevTools Protocol |
| synchrony | 0.10.2 | webpack bundle deobfuscator |
| httpx | 0.28.1 | Async HTTP/2 client |
| aiohttp | 3.14.1 | High-concurrency scraping |
| beautifulsoup4 | 4.15.0 | HTML parsing |
| lighthouse | 12.8.2 | Performance auditing |
| axe-cli | latest | Accessibility testing |
| html-validate | latest | HTML spec validation |

### AI MODELS (all live)
| Model | Key | Use Case |
|-------|-----|---------|
| GPT-4o | OPENAI_API_KEY ✅ | Reasoning, code gen, analysis |
| gpt-image-1 | OPENAI_API_KEY ✅ | Image generation (DALL-E) |
| Claude (via Base44) | native | Orchestration, long context |
| Cohere | COHERE_API_KEY ✅ | RAG, semantic search |
| Vercel AI Gateway | AI_GATEWAY_API_KEY ✅ | Multi-model routing |

### COMMUNICATIONS
| Tool | Key | Use Case |
|------|-----|---------|
| Twilio SMS | TWILIO_AUTH_TOKEN ✅ | Lead notifications to Jeremy |
| Twilio WhatsApp | TWILIO_AUTH_TOKEN ✅ | Business outreach (needs template approval) |
| HeyGen | HEYGEN_API_KEY ✅ | Personalized Jeremy avatar videos |

### DATA + CRM
| Tool | Key | Use Case |
|------|-----|---------|
| Supabase | SUPABASE_SERVICE_ROLE_KEY ✅ | Primary DB + agent memory |
| HubSpot | HUBSPOT_ACCESS_TOKEN ✅ | CRM, 245655125, na2 |
| GitHub | GITHUB_TOKEN ✅ | Repo management |
| Vercel | VERCEL_TOKEN ✅ | Deployments |
| Google Drive | GOOGLE_APPLICATION_CREDENTIALS ⚠️ (truncated) | File storage |

## TOOL EXECUTION ORDER (every clone/build)
```
BENCHMARK PHASE:
  1. ScrapingBee → raw HTML (bypasses protection)
  2. Firecrawl → clean markdown + structure
  3. Browserless → screenshot + JS-rendered version
  4. synchrony → deobfuscate any webpack bundles
  5. wabt → decompile any .wasm files

BUILD PHASE:
  6. Next.js + TypeScript + Tailwind
  7. Shadcn/ui components
  8. React Hook Form + Zod

VALIDATION PHASE:
  9.  Pass 1: tsc --noEmit + eslint
  10. Pass 2: visual spec checklist
  11. Pass 3: Lighthouse/PageSpeed + axe + html-validate

DEPLOY PHASE:
  12. Push to GitHub branch
  13. Vercel preview deploy
  14. Playwright smoke tests
  15. Jeremy approval
  16. Merge to main → production
```

## MISSING (still needed)
- PAGESPEED_API_KEY — get free at console.cloud.google.com (25k/day quota)
- SEMRUSH/AHREFS — using Google Custom Search API + ScrapingBee SERP scraping instead (free)
- FIRECRAWL_API_KEY — needs regeneration at app.firecrawl.dev
- GCP full private key — current GOOGLE_APPLICATION_CREDENTIALS is truncated (65 chars, need ~1700)

