import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { NewLeadForm } from "../../pages/UserPages/Forms/NewLeadForm.ts";
import { UserDashboard } from "../../pages/AdminAndSupportPages/UserDashboardPages/DashboardPage.ts";
import { LeadProfilePage } from "../../pages/UserPages/leadProfilePage.ts";
import { LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils.ts";
import { Utils, AheadOf } from "../../utils/PlaywrightTestUtils.ts";

test('No Future Activity Dashboard Test', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const sidePanal = new SidePanal(page);
  const newLeadForm = new NewLeadForm(page);
  const userDashboard = new UserDashboard(page);
  const leadPage = new LeadProfilePage(page);
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
  const utils = new Utils();

  const randomFirstName = await utils.generateRandomString(8, {casing: "lower", includeNumbers: false, includeSpecialChars: false});
  const randomEmail = await utils.generateRandomEmail();

  await loginPage.login(properties.Dashboard_Sale_email, properties.PASSWORD);
  await utils.waitTillFullPageLoad(page);

  await userDashboard.refreshDashboard();
  const initialCount = parseInt(await leadPage.getNoFutureActivityCount() || "0");

  await sidePanal.clickOnCreateLead();
  await utils.waitTillFullPageLoad(page);

  await newLeadForm.enterFirstName(randomFirstName);
  await newLeadForm.enterPrimaryEmail(randomEmail);
  await newLeadForm.selectLeadCampaign("organic");
  await newLeadForm.clickOnSaveLeadButton();

  const leadId = await leadPage.getLeadId();

  await userDashboard.clickOnHome();
  await utils.waitTillFullPageLoad(page);

  await userDashboard.refreshDashboard();
  const finalCount = parseInt(await leadPage.getNoFutureActivityCount() || "0");
  expect(finalCount).toBe(initialCount + 1);

  const startTime = await utils.calculateFutureDate(AheadOf.Hour, 2, "yyyy-MM-dd HH:mm");
  const endTime = await utils.calculateFutureDate(AheadOf.Hour, 3, "yyyy-MM-dd HH:mm");

  const siteVisitResult = await leadAPIUtils.scheduleSiteVisit(
    leadId,
    startTime,
    endTime,
    properties.Dashboard_Sale_email,
    properties.Project_id,
    false,
    "Property viewing",
    "Test participant"
  );
  expect(siteVisitResult).toBeDefined();

  await userDashboard.clickOnHome();
  await utils.waitTillFullPageLoad(page);

  await userDashboard.refreshDashboard();
  const countAfterSiteVisit = parseInt(await leadPage.getNoFutureActivityCount() || "0");

  expect(countAfterSiteVisit).toBe(finalCount - 1);

});
