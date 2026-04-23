import { test, expect } from '@playwright/test';
import { properties } from '../Environment/env';

test('Testrail', async ({ page }) => {
  console.log("SELLD_ADMIN_EMAIL: ", properties.Admin_email);
  console.log("SELLD_CLIENT_ID: ", properties.CLIENT_ID);
  console.log("SELLD_FULL_ACCESS_API: ", properties.FULL_ACCESS_API);
  console.log("SELLD_PASSWORD: ", properties.PASSWORD);
  console.log("SELLD_RESTRICTED_ACCESS_API: ", properties.RESTRICTED_ACCESS_API);
  
});
