import { test, expect } from "@playwright/test";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { ActivityType, LeadAPIUtils, ReassignedDirection } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';
import { ReassignLeadForm } from '../../pages/UserPages/Forms/ReassignLeadForm';
import { NotyMessage } from "../../pages/AdminAndSupportPages/NotyMessage.ts";
import { SettingPage } from "../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { BulkActionAPIUtils } from "../../utils/APIUtils/BulkActionAPIUtils.ts";
import { BulkReassignPage } from "../../pages/AdminAndSupportPages/BulkReassignPage.ts";
import { BulkReassignLeadImportCSVGenerator } from "../../utils/CSVGenerator/BulkReassignLeadImportCSVGenerator.ts";
import { UserAPIUtils } from "../../utils/APIUtils/UserAPIUtils.ts";
import { CRMAPIUtils } from "../../utils/APIUtils/CRMAPIUtils.ts";
import { ReassignLeadStrategy } from "../../utils/APIUtils/CRMAPIUtils.ts";
import { UserRoleFilter } from "../../utils/APIUtils/CRMAPIUtils.ts";

const clientId = properties.ES_Test_Client_Id_01;
const fullAccessAPI = properties.ES_Test_Client_FullAccess_API_01;
const restrictedAccessAPI = properties.ES_Test_Client_RestrictedAccess_API_01;

test.describe.configure({ mode: "serial"});
test.setTimeout(3  * 60 * 1000);

test('Reassing lead manually By sales for team strategy', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const notyMessage = new NotyMessage(page);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const reassignLeadForm = new ReassignLeadForm(page);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    await crmAPIUtils.updateReassignLeadStrategy(ReassignLeadStrategy.Team);

    
    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    
    const userAPIUtils = new UserAPIUtils(clientId, fullAccessAPI);
    const userTeamResolution2 = await userAPIUtils.getUserTeamIdAndName(salesUserSummary2.id);

    const reassignedByUsersCountInitial = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary1.id, ReassignedDirection.By);
    const reassignedToUsersCountInitial = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary2.id, ReassignedDirection.To);

    const reassignedByUsersCountInitial_1 = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary2.id, ReassignedDirection.By);
    const reassignedToUsersCountInitial_1 = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary1.id, ReassignedDirection.To);
   
    await loginPage.login(salesUserSummary1.email, properties.PASSWORD);

    const leadId = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Reassign lead manually by sales","","","",salesUserSummary1.id,"");
    await globalSearchPage.globalSearch("#"+leadId.sell_do_lead_id);

    await leadPage.clickOnMoreButton();
    await leadPage.clickOnReassignActionButton();

    await reassignLeadForm.selectTeam(userTeamResolution2.teamName!);
    await reassignLeadForm.selectSalesForReassing(salesUserSummary2.name);
    await reassignLeadForm.clickOnReassingButton();

    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toEqual("Lead re assigned successfully.");

    const reassignedByUsersCountFinal = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary1.id, ReassignedDirection.By);
    expect(reassignedByUsersCountFinal).toEqual(reassignedByUsersCountInitial+1);

    const reassignedToUsersCountFinal = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary2.id, ReassignedDirection.To);
    expect(reassignedToUsersCountFinal).toEqual(reassignedToUsersCountInitial+1);

    const reassignedByUsersCountFinal_1 = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary2.id, ReassignedDirection.By);
    expect(reassignedByUsersCountFinal_1).toEqual(reassignedByUsersCountInitial_1);

    const reassignedToUsersCountFinal_1 = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary1.id, ReassignedDirection.To);
    expect(reassignedToUsersCountFinal_1).toEqual(reassignedToUsersCountInitial_1);

    await utils.print(`Manually reassigned lead ID by team strategy #${leadId.sell_do_lead_id}`);
});


test('Reassing lead manually By sales for project strategy', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const notyMessage = new NotyMessage(page);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const reassignLeadForm = new ReassignLeadForm(page);
    const userAPIUtils = new UserAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    await crmAPIUtils.updateReassignLeadStrategy(ReassignLeadStrategy.Project);
    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});

    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();

    // get sales id to sales name
    const salesIdToSalesName = (await userAPIUtils.getUserDetails(projectSummary.firstProjectSaleId!)).full_name;
    
    const reassignedByUsersCountInitial = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary1.id, ReassignedDirection.By);
    const reassignedToUsersCountInitial = await leadAPIUtils.getReassignedToUsersCount(projectSummary.firstProjectSaleId!, ReassignedDirection.To);

    const reassignedByUsersCountInitial_1 = await leadAPIUtils.getReassignedToUsersCount(projectSummary.firstProjectSaleId!, ReassignedDirection.By);
    const reassignedToUsersCountInitial_1 = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary1.id, ReassignedDirection.To);
   
    await loginPage.login(salesUserSummary1.email, properties.PASSWORD);

    const leadId = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Reassign lead manually by sales","","","",salesUserSummary1.id,"");
    await globalSearchPage.globalSearch("#"+leadId.sell_do_lead_id);

    await leadPage.clickOnMoreButton();
    await leadPage.clickOnReassignActionButton();

    await reassignLeadForm.selectProject(projectSummary.name);
    await reassignLeadForm.selectSalesForReassing(salesIdToSalesName);
    await reassignLeadForm.clickOnReassingButton();

    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toEqual("Lead re assigned successfully.");

    const reassignedByUsersCountFinal = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary1.id, ReassignedDirection.By);
    expect(reassignedByUsersCountFinal).toEqual(reassignedByUsersCountInitial+1);

    const reassignedToUsersCountFinal = await leadAPIUtils.getReassignedToUsersCount(projectSummary.firstProjectSaleId!, ReassignedDirection.To);
    expect(reassignedToUsersCountFinal).toEqual(reassignedToUsersCountInitial+1);

    const reassignedByUsersCountFinal_1 = await leadAPIUtils.getReassignedToUsersCount(projectSummary.firstProjectSaleId!, ReassignedDirection.By);
    expect(reassignedByUsersCountFinal_1).toEqual(reassignedByUsersCountInitial_1);

    const reassignedToUsersCountFinal_1 = await leadAPIUtils.getReassignedToUsersCount(salesUserSummary1.id, ReassignedDirection.To);
    expect(reassignedToUsersCountFinal_1).toEqual(reassignedToUsersCountInitial_1);

    await utils.print(`Manually reassigned lead ID by project strategy #${leadId.sell_do_lead_id}`)
});

test('Reassign by import', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
    const sidePanal = new SidePanal(page);
    const settingPage = new SettingPage(page);
    const bulkReassignPage = new BulkReassignPage(page);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);

    const reassignCsv = new BulkReassignLeadImportCSVGenerator(
        clientId,
        fullAccessAPI,
        restrictedAccessAPI,
    );
    const { filePath, leads } = await reassignCsv.bulkReassignLeadImportCsvGenerator({
        rowCount: 2,
        createLeadSalesId: salesUserSummary1.id,
        csvSalesIdColumn: salesUserSummary2.id,
    });

    const leadID1_DB = await leadAPIUtils.getLeadId(leads[0].sellDoLeadId);
    const leadID2_DB = await leadAPIUtils.getLeadId(leads[1].sellDoLeadId);

    expect((await leadAPIUtils.getLeadDetails(leadID1_DB)).sales_id).toBe(salesUserSummary1.id);
    expect((await leadAPIUtils.getLeadDetails(leadID2_DB)).sales_id).toBe(salesUserSummary1.id);

    await loginPage.login(adminUserSummary.email, properties.PASSWORD);

    await sidePanal.clickOnSettings();

    await settingPage.clickOnReassignLeads();

    await bulkReassignPage.clickOnChooseFile(filePath);

    await bulkReassignPage.clickOnUploadButton();

    await bulkActionAPIUtils.waitTillBulkReassignImportDone();

    const leadDetails1 = await leadAPIUtils.getLeadDetails(leadID1_DB);
    const leadDetails2 = await leadAPIUtils.getLeadDetails(leadID2_DB);

    expect(leadDetails1.currently_in).toBe("sales");
    expect(leadDetails2.currently_in).toBe("sales");

    expect(leadDetails1.sales_id).toBe(salesUserSummary2.id);
    expect(leadDetails2.sales_id).toBe(salesUserSummary2.id);

    const leadDetails1_1 = await leadAPIUtils.getLeadActivity(leads[0].sellDoLeadId, ActivityType.Feed);
    const leadDetails2_2 = await leadAPIUtils.getLeadActivity(leads[1].sellDoLeadId, ActivityType.Feed);

    expect(leadDetails1_1.results[0].feed.content).toContain(`Lead Reassigned to ${salesUserSummary2.name} by Admin. Reason: Bulk re-assignment via file.`);
    expect(leadDetails2_2.results[0].feed.content).toContain(`Lead Reassigned to ${salesUserSummary2.name} by Admin. Reason: Bulk re-assignment via file.`);
    
    await utils.print(`Reassigned by import lead ID #${leads[0].sellDoLeadId} and #${leads[1].sellDoLeadId}`)
});

test.only('Reassign by push', async ({ page }) => {


    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const constants =crmAPIUtils.getConstants("aniket.khandizod+pympmmsnhqnzvr0@sell.do");
    console.log("constants: " + JSON.stringify(constants));

});