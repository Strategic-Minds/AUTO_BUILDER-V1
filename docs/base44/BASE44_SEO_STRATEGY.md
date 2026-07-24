# BASE44 SEO STRATEGY — GHOST AGENT
## Version: 1.0 | Effective: 2026-06-25

## DECISION: USE GOOGLE INSTEAD OF SEMRUSH/AHREFS
SEMrush = $200/mo. Ahrefs = $100/mo. Both unnecessary.
We use Google's own APIs — FREE and more authoritative than any third party.

## FREE GOOGLE SEO STACK

### 1. Google Custom Search API
- Free: 100 queries/day | Paid: $5/1000 queries
- Use: SERP position checking, competitor keyword research
- Endpoint: https://www.googleapis.com/customsearch/v1

### 2. Google Search Console API (via OAuth)
- Free: unlimited
- Use: Real click/impression/CTR data for our own sites
- Endpoint: https://www.googleapis.com/webmasters/v3/

### 3. Google PageSpeed Insights API
- Free with API key: 25,000 requests/day
- Use: Competitor performance benchmarking
- Endpoint: https://www.googleapis.com/pagespeedonline/v5/runPagespeed

### 4. ScrapingBee SERP Scraping
- Already configured: SCRAPINGBEE_API_KEY ✅
- Use: Full Google SERP scraping — top 10 results, featured snippets, PAA
- Call: ?url=https://www.google.com/search?q=epoxy+floor+phoenix

### 5. Firecrawl Site Crawl (once key fixed)
- Use: Full competitor site content analysis
- Output: Clean markdown for keyword extraction

## KEYWORD RESEARCH PROCESS (automated)
1. ScrapingBee → scrape Google SERP for target keyword
2. Extract top 10 organic results
3. Firecrawl each result → get full content
4. GPT-4o → extract keyword patterns, headings, content structure
5. Build content brief for GHOST agent
6. Output: keyword list, competitor content gaps, recommended structure

## GHOST AGENT CONTENT PIPELINE
For each target city (70 cities):
1. Research: Google SERP scrape for '[service] [city]'
2. Analyze: Top 3 competitors in that city
3. Brief: AI-generated content brief
4. Write: GPT-4o generates SEO-optimized page
5. Optimize: Schema.org LocalBusiness + Service markup
6. Publish: Via Postproxy API to social channels
7. Track: Google Search Console for ranking progress

## LOCAL SEO SCHEMA (required on every city page)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Phoenix Epoxy Pros",
  "url": "https://phoenixepoxypros.com",
  "telephone": "+1-XXX-XXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[address]",
    "addressLocality": "[city]",
    "addressRegion": "[state]",
    "postalCode": "[zip]",
    "addressCountry": "US"
  },
  "geo": {"@type": "GeoCoordinates", "latitude": 0, "longitude": 0},
  "openingHoursSpecification": [...],
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "847"},
  "priceRange": "$$",
  "serviceArea": {"@type": "GeoCircle", "geoMidpoint": {...}, "geoRadius": "50000"}
}
```

