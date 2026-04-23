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

test('Testrail', async ({ page }) => {
  await page.goto('/');
  console.log("SELLD_ADMIN_EMAIL: ", process.env.SELLD_ADMIN_EMAIL);
  console.log("SELLD_CLIENT_ID: ", process.env.SELLD_CLIENT_ID);
  console.log("SELLD_FULL_ACCESS_API: ", process.env.SELLD_FULL_ACCESS_API);
  console.log("SELLD_PASSWORD: ", process.env.SELLD_PASSWORD);
  console.log("SELLD_RESTRICTED_ACCESS_API: ", process.env.SELLD_RESTRICTED_ACCESS_API);
});
