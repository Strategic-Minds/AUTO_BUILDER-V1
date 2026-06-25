# BASE44 TRIPLE VALIDATION PROTOCOL
## Version: 1.0 | Effective: 2026-06-25

## THE LAW
Every build MUST pass all 3 validation passes before any preview or production URL is shared.
FAIL ANY PASS = FIX BEFORE PROCEEDING. No exceptions.

## VALIDATION PASS 1 — CODE QUALITY
Run immediately after writing code. Before first render.

### TypeScript
```bash
npx tsc --noEmit
```
✅ PASS = zero errors
❌ FAIL = fix all type errors first

### ESLint
```bash
npx eslint . --ext .ts,.tsx --max-warnings 0
```
✅ PASS = zero errors, zero warnings
❌ FAIL = fix all lint issues first

### Import Audit
- No unused imports
- No circular dependencies
- All paths resolve correctly

### Security Audit
- No API keys in client-side code
- No console.log in production
- No TODO comments in production paths
- All env vars use process.env
- All user inputs sanitized

## VALIDATION PASS 2 — VISUAL + UX SPEC
Run after first render. Against Jeremy's design system.

### Layout Checklist
- [ ] 220px fixed sidebar on all dashboard pages
- [ ] #F6B800 gold on ALL primary CTAs (no exceptions)
- [ ] Body font ≥ 17px
- [ ] Headlines: heavy/condensed weight (font-weight 700+)
- [ ] Hamburger nav on mobile (< 768px)
- [ ] No layout shift on load (CLS < 0.1)

### Component Checklist
- [ ] All images: Next.js Image component (no raw <img>)
- [ ] All forms: React Hook Form + Zod validation
- [ ] File uploads: useState array + drag-drop + preview grid + count badge
- [ ] All buttons: hover state + disabled state + loading state
- [ ] All data fetches: loading skeleton (not spinner) + error state + empty state
- [ ] All modals: close on escape + close on backdrop click + focus trap

### Accessibility Checklist
- [ ] All images have alt text
- [ ] All inputs have labels
- [ ] Color contrast ≥ 4.5:1 (run axe-core)
- [ ] Tab order logical
- [ ] Focus visible on all interactive elements

## VALIDATION PASS 3 — PERFORMANCE + PRODUCTION READINESS
Run before any deploy.

### Performance Targets (non-negotiable)
- Performance ≥ 85
- Accessibility ≥ 95
- SEO ≥ 95
- Best Practices ≥ 90

### Production Checklist
- [ ] robots.txt present and correct
- [ ] sitemap.xml present and valid
- [ ] OG tags: title, description, image (1200x630px)
- [ ] Schema.org markup for business type
- [ ] 404 page exists and designed
- [ ] All env vars set in Vercel (production + preview + development)
- [ ] No broken links (run link checker)
- [ ] HTTPS everywhere
- [ ] Error boundaries on all data-fetching components
- [ ] Rate limiting on all public API endpoints

### Browser Testing (Playwright — automated)
- [ ] Desktop Chrome: all pages load
- [ ] Mobile Chrome: all pages load
- [ ] All CTAs clickable and functional
- [ ] All forms submit and validate
- [ ] All navigation paths work
- [ ] No console errors on any page

