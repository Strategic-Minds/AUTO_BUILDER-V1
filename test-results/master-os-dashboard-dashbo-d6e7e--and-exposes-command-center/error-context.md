# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: master-os-dashboard.spec.ts >> dashboard loads and exposes command center
- Location: tests/master-os-dashboard.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Enterprise Agent Command Dashboard')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Enterprise Agent Command Dashboard')

```

```yaml
- main:
  - complementary:
    - text: AUTO BUILDER
    - heading "Native Shell" [level=1]
    - navigation: Chat Queue Capabilities Approvals Workers Finance
  - text: Conversation
  - heading "AUTO BUILDER Command Surface" [level=2]
  - paragraph: GPT remains the orchestration brain. Cloud workers and bridges execute recurring operations. Codex is reserved for implementation runtime tasks.
  - button "Functions"
  - text: Mode Dark Primary · Light Optional
- alert
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test'
  2 | 
  3 | test('dashboard loads and exposes command center', async ({ page }) => {
  4 |   await page.goto('/')
> 5 |   await expect(page.getByText('Enterprise Agent Command Dashboard')).toBeVisible()
    |                                                                      ^ Error: expect(locator).toBeVisible() failed
  6 |   await expect(page.getByText('AI Gateway Chat UI')).toBeVisible()
  7 |   await expect(page.getByText('Scoreboard')).toBeVisible()
  8 | })
  9 | 
```