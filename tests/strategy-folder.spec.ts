import { test, expect } from '@playwright/test';

test('dashboard shell renders and exposes approval actions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /AUTO_BUILDER Client Dashboard/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Approve/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Request exact changes/i })).toBeVisible();
});
