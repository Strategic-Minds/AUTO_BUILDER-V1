# Implementation Brief

## Build Target

Create a premium National Epoxy Pros Next.js/Vercel site and app surface that reconstructs the provided collage and builder docs.

The system includes:

- Public marketing site.
- Lead and digital bid flows.
- Floor visualizer landing page.
- Design center and color chart library.
- Nationwide locations surface.
- Service pages.
- Training, business package, and products pages.
- About and contact pages.
- Customer, crew, supervisor, owner, and admin dashboards.
- PWA install surface.
- Cron-backed readiness, source sync, SEO, validation, receipt, and gap review workflows.

## Visual System

Use the uploaded global system:

- Premium black, gold, white, contractor, automotive luxury tone.
- Public pages alternate dark hero bands and bright white sections.
- Dashboards are dark UI with gold outlines, metric cards, sidebars, and dense data panels.
- Headline type should be condensed uppercase: Bebas Neue, Anton, Oswald, or fallback.
- Body type should use Inter or system sans.
- Gold is an accent, not a neon fill.

Core tokens:

```css
:root {
  --nep-black: #050505;
  --nep-black-2: #0B0B0B;
  --nep-panel: #101010;
  --nep-panel-2: #151515;
  --nep-gold: #F5A900;
  --nep-gold-bright: #FFC107;
  --nep-gold-dark: #9B6500;
  --nep-white: #FFFFFF;
  --nep-paper: #F6F6F3;
  --nep-muted: #B8B8B8;
  --nep-border: #2A2A2A;
  --nep-border-gold: #A66A00;
  --nep-success: #22C55E;
  --nep-error: #EF4444;
}
```

## Route Inventory

| Route | Purpose |
|---|---|
| `/` | Public homepage with hero, floor systems, bid CTA, visualizer, design center, gallery, products/training, footer. |
| `/digital-bid` | 60-second bid form, benefit bullets, process steps, dark premium layout. |
| `/visualizer` | Floor visualizer landing page with room mockup and floor system tiles. |
| `/design-center` | Color chart library with tabs, swatch cards, dark background, gold controls. |
| `/locations` | 70+ XPS locations map, search, stats, phone CTA. |
| `/flake-epoxy` | Flake epoxy service page with hero, benefits, blend cards, bid CTA. |
| `/metallic-epoxy` | Metallic epoxy service page with hero, benefits, color cards, bid CTA. |
| `/polished-concrete` | Polished concrete service page with polish-level options. |
| `/stained-concrete` | Stained concrete service page with stain color cards. |
| `/concrete-countertops` | Concrete countertops page with finish cards. |
| `/training` | XPS training and certification page. |
| `/business-packages` | Epoxy business package offers. |
| `/products` | Product and supplies page. |
| `/about` | About National Epoxy Pros with stats and mission. |
| `/contact` | Contact details, form, and map area. |
| `/dashboard/customer` | Customer dashboard with projects, status, appointments. |
| `/dashboard/crew` | Crew leader dashboard with crew KPIs and active project table. |
| `/dashboard/supervisor` | Supervisor dashboard with charts and progress panels. |
| `/dashboard/owner` | Owner dashboard with revenue and KPI overview. |
| `/dashboard/admin` | Admin dashboard with alerts and operations counters. |
| `/install` | PWA install landing panel with phone preview and install buttons. |

## Component Inventory

Public:

- `TopUtilityBar`
- `MainNavbar`
- `HeroSection`
- `StatsBar`
- `FloorSystemCard`
- `BidFormPanel`
- `VisualizerPreview`
- `ColorSwatchCard`
- `DarkCTASection`
- `Footer`

Dashboard:

- `DashboardShell`
- `MetricCard`
- `ProjectCard`
- `DataTable`
- `ChartPanel`
- `AlertList`
- `PwaInstallCard`

## First Build Rule

Use local mock JSON and server route handlers first. Do not block pixel recreation on Supabase, CRM, Drive, or live automation.

## PWA Requirements

- `manifest.webmanifest` or equivalent manifest route.
- App name: `National Epoxy Pros`.
- Shortcuts: bid, locations, color charts, dashboard.
- Install page at `/install`.
- Service worker only after build is stable and browser validation confirms no route breakage.
