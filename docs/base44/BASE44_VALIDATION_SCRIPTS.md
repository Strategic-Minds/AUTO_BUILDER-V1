# BASE44 VALIDATION SCRIPTS
## Version: 1.0 | Effective: 2026-06-25

## PASS 1 — CODE QUALITY (run in project root)
```bash
#!/bin/bash
echo '=== VALIDATION PASS 1 ==='

# TypeScript
echo 'TypeScript check...'
npx tsc --noEmit && echo '✅ TypeScript: PASS' || echo '❌ TypeScript: FAIL'

# ESLint
echo 'ESLint check...'
npx eslint . --ext .ts,.tsx --max-warnings 0 && echo '✅ ESLint: PASS' || echo '❌ ESLint: FAIL'

# Check for console.log
echo 'Console.log check...'
grep -r 'console.log' src/ --include='*.ts' --include='*.tsx' | grep -v 'node_modules' | grep -v '.next' && echo '❌ console.log found' || echo '✅ No console.log: PASS'

# Check for hardcoded colors
echo 'Hardcoded color check...'
grep -r '#[0-9A-Fa-f]\{6\}' src/ --include='*.tsx' --include='*.ts' | grep -v 'F6B800\|D4A000\|0A0A0A\|FAFAFA\|F9F9F9' | grep -v 'node_modules' && echo '⚠️  Hardcoded colors found' || echo '✅ Color system clean: PASS'

# Unused imports (basic check)
echo 'Checking for unused imports...'
npx eslint . --ext .ts,.tsx --rule '{"@typescript-eslint/no-unused-vars": "error"}' --quiet && echo '✅ No unused vars: PASS' || echo '❌ Unused vars found'

echo 'Pass 1 complete.'
```

## PASS 2 — VISUAL SPEC (checklist — manual + automated)
```bash
#!/bin/bash
echo '=== VALIDATION PASS 2 ==='
URL=${1:-http://localhost:3000}

# Screenshot every page
node << 'EOF'
const puppeteer = require('/usr/lib/node_modules/puppeteer');
const pages = ['/', '/about', '/services', '/contact', '/dashboard'];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/root/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-gpu']
  });
  for (const p of pages) {
    try {
      const page = await browser.newPage();
      await page.setViewport({width: 1440, height: 900});
      await page.goto(process.env.URL + p, {timeout: 30000, waitUntil: 'networkidle0'}).catch(()=>{});
      await page.screenshot({path: `/tmp/screenshot_desktop_${p.replace('/','_')||'home'}.png`, fullPage: true});
      
      await page.setViewport({width: 390, height: 844});
      await page.screenshot({path: `/tmp/screenshot_mobile_${p.replace('/','_')||'home'}.png`, fullPage: true});
      
      const consoleLogs = [];
      page.on('console', msg => { if(msg.type()==='error') consoleLogs.push(msg.text()); });
      console.log(`✅ Screenshotted: ${p}`);
      await page.close();
    } catch(e) { console.log(`❌ Failed: ${p} - ${e.message}`); }
  }
  await browser.close();
})();
EOF
echo 'Pass 2 complete. Check /tmp/screenshot_*.png'
```

## PASS 3 — PERFORMANCE (PageSpeed + accessibility)
```bash
#!/bin/bash
echo '=== VALIDATION PASS 3 ==='
URL=${1:-https://xpswebsites.vercel.app}

# PageSpeed Insights
python3 << PYEOF
import requests, sys, os

url = sys.argv[1] if len(sys.argv)>1 else 'https://xpswebsites.vercel.app'
key = os.environ.get('PAGESPEED_API_KEY','')
params = {'url': url, 'strategy': 'mobile', 
          'category': ['performance','accessibility','best-practices','seo']}
if key: params['key'] = key

r = requests.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed', params=params, timeout=60)
if r.status_code == 200:
    cats = r.json().get('lighthouseResult',{}).get('categories',{})
    thresholds = {'performance': 85, 'accessibility': 95, 'best-practices': 90, 'seo': 95}
    for k,v in cats.items():
        score = round(v.get('score',0)*100)
        threshold = thresholds.get(k, 85)
        status = '✅' if score >= threshold else '❌'
        print(f'{status} {k}: {score}/100 (need {threshold}+)')
elif r.status_code == 429:
    print('Rate limited — add PAGESPEED_API_KEY for 25k/day quota')
else:
    print(f'Error: {r.status_code}')
PYEOF
```

