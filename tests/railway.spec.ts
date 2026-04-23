import { test, expect } from '@playwright/test';
import { properties } from '../Environment/env';

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
  console.log("SELLD_ADMIN_EMAIL: ", properties.Admin_email);
  console.log("SELLD_CLIENT_ID: ", properties.CLIENT_ID);
  console.log("SELLD_FULL_ACCESS_API: ", properties.FULL_ACCESS_API);
  console.log("SELLD_PASSWORD: ", properties.PASSWORD);
  console.log("SELLD_RESTRICTED_ACCESS_API: ", properties.RESTRICTED_ACCESS_API);
});
