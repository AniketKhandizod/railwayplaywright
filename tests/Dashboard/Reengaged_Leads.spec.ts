import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { UserDashboard } from "../../pages/AdminAndSupportPages/UserDashboardPages/DashboardPage.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { NewLeadForm } from "../../pages/UserPages/Forms/NewLeadForm.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils.ts";

test('should increase the Re-engaged Leads bucket count after a lead is re-engaged', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const userDashboard = new UserDashboard(page);
  const sidePanal = new SidePanal(page);
  const newLeadForm = new NewLeadForm(page);
  const utils = new Utils();

  await loginPage.login(properties.Dashboard_Sale_email, properties.PASSWORD);
  await utils.waitTillFullPageLoad(page);

  await userDashboard.refreshDashboard();

  const reengagedLeadsCount = await userDashboard.getReengagedLeadsCount();
  expect(reengagedLeadsCount).toBeDefined();

  const randomFirstName1 = await utils.generateRandomString(8, {casing: "lower", includeNumbers: false, includeSpecialChars: false});
  const randomFirstName2 = await utils.generateRandomString(8, {casing: "lower", includeNumbers: false, includeSpecialChars: false});
  const randomEmail = await utils.generateRandomEmail();

  await sidePanal.clickOnCreateLead();
  await utils.waitTillFullPageLoad(page);

  await newLeadForm.enterFirstName(randomFirstName1);
  await newLeadForm.enterPrimaryEmail(randomEmail);
  await newLeadForm.selectLeadCampaign("organic");
  await newLeadForm.clickOnSaveLeadButton();
  await utils.waitTillFullPageLoad(page);
  await userDashboard.clickOnHome();
  await utils.waitTillFullPageLoad(page);
  await userDashboard.refreshDashboard();

  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  const secondLeadResult = await leadAPIUtils.createLeadWithDetails(
    "",
    randomEmail,
    randomFirstName2,
    "website",
    "form",
    "",
    properties.Dashboard_Sale_id,
    properties.srd1
  );

  await userDashboard.refreshDashboard();

  const reengagedLeadsCountAfterCreation = await userDashboard.getReengagedLeadsCount();
  expect(parseInt(reengagedLeadsCountAfterCreation)).toBe(parseInt(reengagedLeadsCount) + 1);
});
