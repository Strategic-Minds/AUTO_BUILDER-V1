# BASE44 BENCHMARK PROTOCOL
## Version: 1.0 | Effective: 2026-06-25

## THE LAW
Before writing ONE LINE of code, I MUST analyze the top 3 best-in-class examples in the target category.
No exceptions. No shortcuts.

## BENCHMARK EXECUTION (automated)
Every benchmark run uses this exact tool stack:
1. ScrapingBee → bypass Cloudflare/bot protection, get raw HTML
2. Firecrawl → extract clean markdown + structure + headings
3. Browserless → screenshot + render JS-heavy pages
4. synchrony → deobfuscate webpack bundles
5. wabt → decompile any .wasm files

## WHAT TO EXTRACT FROM EACH SITE
### Design Intelligence
- Color palette (primary, secondary, accent, neutral)
- Typography (font family, weight, size hierarchy)
- Spacing system (padding, margin, gap values)
- Border radius, shadow styles
- Animation patterns

### Conversion Architecture
- Above-fold structure (what's in first 100vh)
- Primary CTA placement + copy
- Social proof positioning (where reviews appear)
- Form design + field count
- Navigation pattern (sticky? mega-menu? minimal?)
- Trust signals (badges, logos, certifications)

### Technical Stack
- Framework (React, Vue, Next.js, Shopify, etc.)
- CDN / hosting
- Analytics tools
- CRM integrations
- Chat widget
- A/B testing tools

### Performance Baseline
- PageSpeed mobile score
- PageSpeed desktop score
- Time to First Byte
- Core Web Vitals (LCP, FID, CLS)

## BENCHMARK BRIEF OUTPUT (required before code)
```
BENCHMARK: [category]
Date: [date]
Target: [what I'm building]

SITE 1: [URL]
  Design: [3 key design decisions]
  Conversion: [3 key conversion elements]  
  What they do RIGHT: [steal these]
  What they do WRONG: [exploit these gaps]
  Score: [PageSpeed]

SITE 2: [URL]
  [same format]

SITE 3: [URL]
  [same format]

SYNTHESIS:
  Universal gap: [what NONE of the top 3 have — our competitive edge]
  Design winner: [which site has best design — steal this approach]
  Conversion winner: [which site converts best — steal this structure]
  Our differentiator: [the ONE thing that beats all 3]
```

