# Nashville Resin Worx System Inventory

## Current Source Truth

- GitHub repo: `Strategic-Minds/NASHVILLERESINWORX`
- AUTO BUILDER repo: `Strategic-Minds/AUTO_BUILDER`
- Nashville Vercel project: `prj_W0IiCnjOengwEd6h3WI2VRxzJRvA`
- Vercel team: `team_aFdds8lsbHMwe2ip4aQdbQ3d`
- Production alias: `https://nashvilleresinworx-strategic-minds-advisory.vercel.app`
- Latest verified Nashville deployment: `dpl_4u3bZkmJw9TeNz4sX6WPku7dTAvN`
- Remaining stray alias to remove: `ozarkresinworx.vercel.app`

## Repo System

Nashville is a Next.js/Vercel app with a lead-capture surface, Supabase-backed lead persistence, SEO/public-indexing headers, mockup-aligned homepage, and fallback SVG/visual assets that should be replaced with approved Drive assets.

Known package scripts:

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `next lint`
- `typecheck`: `tsc --noEmit`
- `validate:lock`: `node scripts/validate-lock.mjs`

Known dependencies:

- Next.js
- React
- lucide-react
- TypeScript/Tailwind/PostCSS toolchain

## Drive Folder System

Marketing source folder provided by operator:

- `04_MARKETING_CONTENT`: `1IgbbiNq3PUQv82KcoUe3sDJ6FNUmX5nZ`

Contained folders discovered:

- `00_Brand_Kit`: `1wDK0MGRp64f5R7EwGd7Y4iEa-XnRCBbp`
- `BRAND PACK`: `1c983G3gaqV-OsnjC64AGQqZo2kkQdAPb`
- `LOGO`: `1AjldE84qy0epg_O69Pilp4poScswwJyp`
- Other marketing folders include Offers/QR/Coupons, Website Content, SEO Local Pages, Social Posts, Video Scripts, Eden Skye Avatar, HeyGen, Higgsfield AI, Xyla, Metricool, Ads Campaigns, Before/After Library, Prompts, Auto Social, Temp Files, and Quarantine.

Verified Nashville brand assets:

- Primary clean logo PNG: `1TIxz4t2mu_NFgZvYMLKJ0uZ6WY3N3lp9`, 1254x1254
- Full brand pack board PNG: `1OKaxgtblK32U8Ffc16wPKlIDnlW_Eokl`, 1536x1024
- Duplicate brand pack board in LOGO folder: `1NhdE9jBKY6eJymixmn_kb-q5M22YZ3f3`, 1536x1024
- Brand kit markdown: `10vhG0le0ahGrZcHNTZNcueZmF-1SdUBD`

Canonical Nashville asset targets previously identified:

- Logos/icons/fonts: `1ELQQUs4xGZjPnDYiq0_rWYP9mvt_qtAZ`
- Gallery portfolio: `1zgwp-GTJsWMmxTuJD1lla62601ZoTdpq`
- Product images: `1XdvGlJ0NLzAAgTt5arraEhfRBaTHYqA9`
- Process images: `1V7XpCcctSWZmBboZ6RXpjZKDgdfGI_RR`

## Required Asset Copy Queue

1. Copy `1TIxz4t2mu_NFgZvYMLKJ0uZ6WY3N3lp9` into `1ELQQUs4xGZjPnDYiq0_rWYP9mvt_qtAZ` as the primary logo.
2. Copy `1OKaxgtblK32U8Ffc16wPKlIDnlW_Eokl` into `1ELQQUs4xGZjPnDYiq0_rWYP9mvt_qtAZ` as the brand pack board.
3. Use the brand pack board as the extraction source for process/product/gallery crops if no individual source files are provided.
4. Keep original source files in place; clone rather than move.

## Content System Inventory

The Marketing folder already implies these content lanes:

- Brand kit and logo system
- Offers, QR, and coupons
- Website copy and content
- SEO/local pages
- Social posts
- Video scripts
- Avatar assets
- HeyGen video workflow
- Higgsfield AI visual workflow
- Xyla publishing/creative workflow
- Metricool scheduling workflow
- Ads campaigns
- Before/after library
- Prompt library
- Auto Social workspace
- Temp files
- Quarantine

## Pipeline Needed

`DISCOVER -> IDEA -> BRIEF -> GENERATE -> REVIEW -> PERFECT -> SCHEDULE -> POST -> ENGAGE -> ANALYZE -> OPTIMIZE -> ARCHIVE/QUARANTINE`

## Current Blockers

- Google Drive copy/write is not exposed through the read-only Drive connector in the current ChatGPT runtime.
- AUTO BUILDER worker has `drive.uploadFileToFolder` and now includes `drive.copyFileToFolder`, but the deployed worker gate still needs the latest AUTO BUILDER deployment and correct worker env settings.
- Browser screenshot QA and Supabase lead verification remain dependent on the deployed worker or another browser-capable cloud runtime.
