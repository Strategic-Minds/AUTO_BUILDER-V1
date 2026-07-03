# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: strategy-folder.spec.ts >> dashboard shell renders and exposes approval actions
- Location: tests/strategy-folder.spec.ts:3:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /AUTO_BUILDER Client Dashboard/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /AUTO_BUILDER Client Dashboard/i })

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
  1 | import { test, expect } from '@playwright/test';
  2 | 
  3 | test('dashboard shell renders and exposes approval actions', async ({ page }) => {
  4 |   await page.goto('/');
> 5 |   await expect(page.getByRole('heading', { name: /AUTO_BUILDER Client Dashboard/i })).toBeVisible();
    |                                                                                       ^ Error: expect(locator).toBeVisible() failed
  6 |   await expect(page.getByRole('button', { name: /Approve/i })).toBeVisible();
  7 |   await expect(page.getByRole('button', { name: /Request exact changes/i })).toBeVisible();
  8 | });
  9 | 
```