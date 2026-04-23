import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/CommonPages/loginPage";
import { UserDashboard } from "../../pages/AdminAndSupportPages/UserDashboardPages/DashboardPage";
import { Utils } from "../../utils/PlaywrightTestUtils";
import { properties } from "../../properties/v2";
import { SiteVisitPage } from "../../pages/UserPages/Forms/SiteVisitForm";
import { LeadProfilePage } from "../../pages/UserPages/leadProfilePage";
test('Missed Site Visit Count Decrease Test', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userDashboard = new UserDashboard(page);
    const utils = new Utils();
    const siteVisitPage = new SiteVisitPage(page);
    const leadProfilePage = new LeadProfilePage(page);
    // Login and go to dashboard
    await loginPage.login(properties.leadManagementTestUserEmail, properties.PASSWORD);
    await userDashboard.refreshDashboard();

    const initialMissedSiteVisitsCount = await userDashboard.getMissedSiteVisitsCount();
    expect(initialMissedSiteVisitsCount).toBeGreaterThanOrEqual(0);

    await userDashboard.clickMissedSiteVisitsBucket();
    await utils.waitTillFullPageLoad(page);
    await leadProfilePage.clickFirstLeadActionDropdown();
    await leadProfilePage.clickDetailsButtonInDropdown();
    await utils.waitTillFullPageLoad(page);
    await leadProfilePage.clickSiteVisitActivityTab();
    await leadProfilePage.clickSiteVisitActionDropdown();
    await siteVisitPage.MarkDidNotVisit();
    await userDashboard.clickOnHome();
    await utils.waitTillFullPageLoad(page);
    await userDashboard.refreshDashboard();
    await utils.waitTillFullPageLoad(page);
    const finalMissedSiteVisitsCount = await userDashboard.getMissedSiteVisitsCount();
    expect(finalMissedSiteVisitsCount).toBe(initialMissedSiteVisitsCount - 1);
});
