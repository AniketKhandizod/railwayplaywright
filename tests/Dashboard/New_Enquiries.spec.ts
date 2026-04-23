import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { UserDashboard } from "../../pages/AdminAndSupportPages/UserDashboardPages/DashboardPage.ts";

test('New Enquiries Test', async ({ page }) => {
  const utils = new Utils();
  const loginPage = new LoginPage(page);
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
  const userDashboard = new UserDashboard(page);
  await loginPage.login(properties.Dashboard_Sale_email, properties.PASSWORD);
  await userDashboard.refreshDashboard();
  const initialNewEnquiriesCount = await userDashboard.getNewEnquiriesCount();
  const initialCount = parseInt(initialNewEnquiriesCount || "0");
  const email = await utils.generateRandomEmail();
  const firstName = await utils.generateRandomString(8, {casing: "lower", includeNumbers: false, includeSpecialChars: false});
  const leadResponse = await leadAPIUtils.createLeadWithDetails(
    "",
    email,
    firstName,
    properties.Source,
    properties.SubSource,
    properties.Project_id,
    properties.Dashboard_Sale_id,
    properties.Campeign_id
  );
  expect(leadResponse.sell_do_lead_id).toBeDefined();
  await userDashboard.refreshDashboard();
  const newEnquiriesCount = await userDashboard.getNewEnquiriesCount();
  const newCount = parseInt(newEnquiriesCount || "0");
  expect(newCount).toBe(initialCount + 1);
  await leadAPIUtils.stageChange(leadResponse.sell_do_lead_id, "prospect", "");
  await userDashboard.clickOnHome();
  await userDashboard.refreshDashboard();
  const finalNewEnquiriesCount = await userDashboard.getNewEnquiriesCount();
  const finalCount = parseInt(finalNewEnquiriesCount || "0");
  expect(finalCount).toBe(initialCount);
  await utils.waitTillFullPageLoad(page);
  await userDashboard.clickOnHome();
});
