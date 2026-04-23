import { test, expect } from '@playwright/test';

test.describe('railway.com', () => {
  test('title references Railway', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Railway/i);
  });

  test('hero heading is visible', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /ship software peacefully/i,
      }),
    ).toBeVisible();
  });

  test('Product control in main nav', async ({ page }) => {
    await page.goto('/');
    const main = page.getByRole('navigation', { name: 'Main' });
    await expect(main.getByRole('button', { name: 'Product' })).toBeVisible();
  });
});
