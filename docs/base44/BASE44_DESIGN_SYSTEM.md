# BASE44 DESIGN SYSTEM — STRATEGIC MINDS
## Version: 1.0 | Effective: 2026-06-25 | Applies to: ALL BUILDS

## MANDATORY CSS VARIABLES (copy into every globals.css)
```css
:root {
  /* Brand Colors */
  --color-primary: #F6B800;        /* Gold — CTAs ONLY */
  --color-primary-dark: #D4A000;   /* Gold hover state */
  --color-primary-light: #FFD84D;  /* Gold light accent */
  
  /* Neutrals */
  --color-black: #0A0A0A;          /* Near-black body */
  --color-white: #FAFAFA;          /* Near-white background */
  --color-gray-50: #F9F9F9;
  --color-gray-100: #F0F0F0;
  --color-gray-200: #E0E0E0;
  --color-gray-400: #9E9E9E;
  --color-gray-600: #616161;
  --color-gray-900: #111111;
  
  /* Typography */
  --font-size-xs: 13px;
  --font-size-sm: 15px;            /* Minimum small text */
  --font-size-base: 17px;          /* Minimum body text */
  --font-size-lg: 19px;
  --font-size-xl: 22px;
  --font-size-2xl: 28px;
  --font-size-3xl: 36px;
  --font-size-4xl: 48px;
  --font-size-5xl: 64px;
  
  /* Layout */
  --sidebar-width: 220px;          /* FIXED — never change */
  --header-height: 64px;
  --content-max-width: 1280px;
  
  /* Spacing (8px base) */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;
  --space-8: 64px;
  --space-12: 96px;
  --space-16: 128px;
  
  /* Effects */
  --border-radius-sm: 4px;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-lg: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
  --shadow-xl: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
}
```

## TYPOGRAPHY RULES
- Body text: minimum 17px, line-height 1.6
- Headlines: font-weight 700 or 900, condensed when possible
- Never use font smaller than 13px (--font-size-xs)
- Headings hierarchy: H1(48-64px) H2(36px) H3(28px) H4(22px) H5(19px)

## COLOR USAGE RULES
- #F6B800 gold: PRIMARY CTAs ONLY — never decorative
- Black (#0A0A0A): headings, body text, dark sections
- White (#FAFAFA): backgrounds, card text on dark
- No hardcoded hex colors anywhere except design tokens file
- All section backgrounds: either --color-black or --color-white (no grays)

## CTA BUTTON STANDARD
```tsx
<button className="bg-[#F6B800] hover:bg-[#D4A000] text-black font-bold 
  px-8 py-4 rounded-lg text-lg transition-all duration-200 
  hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg">
  Get Free Quote →
</button>
```

## SIDEBAR STANDARD (all dashboards)
```tsx
<aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#0A0A0A] 
  border-r border-white/10 flex flex-col z-40">
  {/* Logo */}
  {/* Navigation */}
  {/* User/Profile at bottom */}
</aside>
<main className="ml-[220px] min-h-screen bg-[#FAFAFA]">
  {/* Page content */}
</main>
```

## 10-SECTION HOMEPAGE LAW (epoxy/service sites)
Every service site homepage MUST have these 10 sections in order:
1. HERO — H1 + subtext + gold CTA + video/image background
2. TRUST BAR — review count, years, certifications, partner logos
3. SERVICES — 3-4 cards with icon, title, 1-line desc, CTA
4. PROCESS — 4-step numbered (how we work)
5. GALLERY — before/after grid (minimum 6 pairs)
6. FLOOR VISUALIZER — FloorVision Pro embed
7. TESTIMONIALS — 3 reviews with stars
8. SERVICE AREAS — map or city list
9. FAQ — 6-8 Q&A with Schema.org markup
10. CTA BANNER — final conversion section before footer

