import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { UserDashboard } from "../../pages/UserPages/DashboardPage.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";

test('Validate Dashboard Refresh with Time Validation', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const userDashboard = new UserDashboard(page);
  const utils = new Utils();

  //  Login with credentials
  await loginPage.login(properties.leadManagementTestUserEmail, properties.PASSWORD);
  await utils.waitTillFullPageLoad(page);

  const beforeRefreshTime = new Date();
  await userDashboard.refreshDashboard();
  const afterRefreshTime = new Date();

  // Calculate and log the time difference
  const timeDifference = afterRefreshTime.getTime() - beforeRefreshTime.getTime();
  expect(timeDifference).toBeLessThan(10000); // Should complete within 10 seconds
});
