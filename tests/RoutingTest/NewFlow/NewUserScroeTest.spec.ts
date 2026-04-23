import { test, expect } from '@playwright/test';
import { properties } from "../../../properties/v2.ts";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../../pages/CommonPages/loginPage.ts";
import { SettingPage } from '../../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts';
import { ManageUserPage } from '../../../pages/AdminAndSupportPages/UserManagementPages/ManageUserPage.ts';
import { LeadAPIUtils } from '../../../utils/APIUtils/LeadAPIUtils.ts';
import { UserScorePage } from '../../../pages/AdminAndSupportPages/UserManagementPages/UserScorePage.ts';
import { SidePanal } from "../../../pages/AdminAndSupportPages/SidePanal.ts";
import { CRMAPIUtils, PushLeadStrategy, UserRoleFilter } from '../../../utils/APIUtils/CRMAPIUtils.ts';
import { UserManagementAPIUtils } from '../../../utils/APIUtils/UserManagementAPIUtils.ts';

const clientId = properties.New_Routing_Client_Id;
const fullAccessAPI = properties.New_Routing_Client_FullAccess_API;
const restrictedAccessAPI = properties.New_Routing_Client_RestrictedAccess_API;

test.describe.configure({ mode: "serial"});
test('Validate user score for multi routing rule strategy', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const manageUserPage = new ManageUserPage(page);
    const userScorePage = new UserScorePage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary.id, true);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary.id,0,0,24,0);

    await loginPage.login(adminUserSummary.email, properties.PASSWORD);

    await settingPage.clickOnUserManagement();

    await manageUserPage.clickUserScore();
    
    await userScorePage.applySalesFilter(salesUserSummary.name.split(" ")[0]);

    await utils.waitTillFullPageLoad(page);

    const beforeUserScore = await userScorePage.getFirstSalesUserScore();
    const firstUserName = await userScorePage.getFirstSalesUserName();
    const firstUserRole = await userScorePage.getFirstSalesUserRole();
    const firstUserTeam = await userScorePage.getFirstSalesUserTeam();

    expect(firstUserName).toContain(salesUserSummary.name.split(" ")[0])
    expect(firstUserRole).toContain("sales")
    expect(firstUserTeam).toContain("Default Team")

    await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Score Test","","","",salesUserSummary.id,"");
    
    await page.reload();

    const afterUserScore = await userScorePage.getFirstSalesUserScore();
    expect(parseInt(afterUserScore)).toBeGreaterThan(parseInt(beforeUserScore))
});

test('Validate user score reduced to zero and validate count for multi routing rule strategy', async ({ page }) => {

    const numberOfLeads = 2;
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const manageUserPage = new ManageUserPage(page);
    const userScorePage = new UserScorePage(page);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary.id,0,0,24,0);

    await loginPage.login(adminUserSummary.email, properties.PASSWORD);

    await settingPage.clickOnUserManagement();

    await manageUserPage.clickUserScore();
    
    await userScorePage.applySalesFilter(salesUserSummary.name.split(" ")[0]);

    await userScorePage.updateUserScore(0);

    await page.reload();

    const scoreAfterReset = await userScorePage.getFirstSalesUserScore();
    expect(scoreAfterReset).toEqual("0");

    for (let index = 0; index < numberOfLeads; index++) {
       await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Score Test","","","",salesUserSummary.id,"");
    }

    await page.reload();

    const scoreAfterLeads = await userScorePage.getFirstSalesUserScore();
    expect(scoreAfterLeads).toEqual(`${numberOfLeads}`);
    
});


test('Validate user score for Increment User Score flag for multi routing rule strategy', async ({ page }) => {

    const utils = new Utils();
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const manageUserPage = new ManageUserPage(page);
    const userScorePage = new UserScorePage(page);
    const sidePanal = new SidePanal(page);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});

    const preSalesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});

    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary({index:0});

    await loginPage.loginWithClientId(properties.SM_00, properties.PASSWORD, clientId);

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(preSalesUserSummary.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(preSalesUserSummary.id,0,0,24,0);

    // Update presales configuration
    await crmAPIUtils.updatePresalesConfiguration(PushLeadStrategy.TEAM, false, 1, true, 10, true, true);
    
    await sidePanal.clickOnSettings();

    await settingPage.clickOnUserManagement();

    await manageUserPage.clickUserScore();

    await userScorePage.applySalesFilter(salesUserSummary.name.split(" ")[0]);
    await page.reload();
    const beforeUserScore = await userScorePage.getFirstSalesUserScore();

    await userScorePage.applySalesFilter(salesUserSummary2.name.split(" ")[0]);
    await page.reload();
    const beforeUserScore2 = await userScorePage.getFirstSalesUserScore();
    
    await leadAPIUtils.updateIncrementUserScoreFlag(false);
    const leadID = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Score Test","","",projectSummary.id,preSalesUserSummary.id,"");
    await leadAPIUtils.stageChange(leadID.sell_do_lead_id, "prospect","");

    await leadAPIUtils.pushToSales(leadID.sell_do_lead_id, salesUserSummary.id, await userManagementAPIUtils.getUserTeamId(salesUserSummary.id));
    await leadAPIUtils.reassignLead(leadID.sell_do_lead_id, await userManagementAPIUtils.getUserTeamId(salesUserSummary2.id), salesUserSummary2.id);
    
    // ----------------
    await leadAPIUtils.updateIncrementUserScoreFlag(true);
    const leadID2 = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Score Test","","",projectSummary.id,preSalesUserSummary.id,"");
    await leadAPIUtils.stageChange(leadID2.sell_do_lead_id, "prospect","");

    await leadAPIUtils.pushToSales(leadID2.sell_do_lead_id, salesUserSummary.id, await userManagementAPIUtils.getUserTeamId(salesUserSummary.id));
    await leadAPIUtils.reassignLead(leadID2.sell_do_lead_id, await userManagementAPIUtils.getUserTeamId(salesUserSummary2.id), salesUserSummary2.id);

    await userScorePage.applySalesFilter(salesUserSummary.name.split(" ")[0]);
    await page.reload();
    const afterUserScore = await userScorePage.getFirstSalesUserScore();
    expect(parseInt(afterUserScore)).toEqual(parseInt(beforeUserScore)+1);

    await userScorePage.applySalesFilter(salesUserSummary2.name.split(" ")[0]);
    await page.reload();
    const afterUserScore2 = await userScorePage.getFirstSalesUserScore();
    expect(parseInt(afterUserScore2)).toEqual(parseInt(beforeUserScore2)+1);
});