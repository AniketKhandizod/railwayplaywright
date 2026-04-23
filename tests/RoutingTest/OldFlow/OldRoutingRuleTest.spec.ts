import { test, expect } from '@playwright/test';
import { properties } from "../../../properties/v2.ts";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../../pages/CommonPages/loginPage.ts";
import { SettingPage } from "../../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts";
import { LeadAPIUtils } from "../../../utils/APIUtils/LeadAPIUtils.ts";
import { MediumType, RoutingAPIUtils, RoutingRuleStrategy } from "../../../utils/APIUtils/RoutingAPIUtils.ts";
import { RoutingConfigurationPage,mediumRoutingStrategy,mediumType } from "../../../pages/AdminAndSupportPages/RoutingPages/RoutingConfigurationPage.ts";
import { NotyMessage } from "../../../pages/AdminAndSupportPages/NotyMessage.ts";
import { RoutingSetupPage } from "../../../pages/AdminAndSupportPages/RoutingPages/RoutingSetupPage.ts";
import { SidePanal } from "../../../pages/AdminAndSupportPages/SidePanal.ts";
import { BulkCallAvailabilitiesPage } from "../../../pages/AdminAndSupportPages/UserManagementPages/BulkCallAvailabilitiesPage.ts";
import { ManageUserPage } from "../../../pages/AdminAndSupportPages/UserManagementPages/ManageUserPage.ts";
import { UserManagementAPIUtils } from "../../../utils/APIUtils/UserManagementAPIUtils.ts";
import { CRMAPIUtils, UserRoleFilter } from '../../../utils/APIUtils/CRMAPIUtils.ts';
import { CampaignAPIUtils } from '../../../utils/APIUtils/CampaignAPIUtils.ts';
import { InventoryCreator } from '../../../utils/APIUtils/InventoryAPIUtils/InventoryCreator.ts';

const clientId = properties.Client_id;
const fullAccessAPI = properties.FullAccess_API;
const restrictedAccessAPI = properties.RestrictedAccess_API;
test.describe.configure({ mode: "serial"});
test.beforeEach(async () => {
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingConfiguration();
});
test.setTimeout(15 * 60 * 1000);

test('Validate lead routing and assignment of lead', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingPage = new RoutingConfigurationPage(page);
    const notyMessage = new NotyMessage(page);
    const routingSetupPage = new RoutingSetupPage(page);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const preSalesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});
    const preSalesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:1});

    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(preSalesUserSummary.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(preSalesUserSummary2.id, true);

    await loginPage.login(adminUserSummary.email, properties.PASSWORD);

    await settingPage.clickOnRoutingSetup();

    await routingSetupPage.clickOnRoutingConfiguration();

    await routingPage.saveRoutingConfiguration();

    const actual = await notyMessage.getNotyMessage(false);

    expect(actual).toEqual("routing configuration updated successfully");

    // Create Rule for API
    await routingPage.clickOnCreateNewRule();

    await routingPage.enterRuleName("API")

    await routingPage.selectMediumType(mediumType.apiclient);

    await routingPage.selectSalesForRule(salesUserSummary.name);

    await routingPage.clickOnSaveRule();

    const actual2 = await notyMessage.getNotyMessage(true);

    expect(actual2).toContain("successfully");

    // Create Rule for email
    await routingPage.clickOnCreateNewRule();

    await routingPage.enterRuleName("Email")

    await routingPage.selectMediumType(mediumType.email);

    await routingPage.selectSalesForRule(preSalesUserSummary.name);

    await routingPage.clickOnSaveRule();

    const actual3 = await notyMessage.getNotyMessage(true);

    expect(actual3).toContain("successfully");

    // Create Rule for whatsApp
    await routingPage.clickOnCreateNewRule();

    await routingPage.enterRuleName("WhatsApp")

    await routingPage.selectMediumType(mediumType.whatsapp);

    await routingPage.selectSalesForRule(preSalesUserSummary2.name);

    await routingPage.clickOnSaveRule();

    const actual4 = await notyMessage.getNotyMessage(true);

    expect(actual4).toContain("successfully");

    // Validate API routing
    const leadEmail = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail ,"Routing Lead","","","","","");
    const leadReponse = await leadAPIUtils.leadRetrieve(leadEmail);
    await utils.print(`leadEmail: ${leadEmail}`,`Sales name: ${leadReponse.sales_details.name}` );
    expect(salesUserSummary.id).toEqual(leadReponse.sales_details.id);

    // Validate WhatsApp routing
    const leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting,"Hello");
    const leadReponse2 = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
    await utils.print(`leadEmailForPhoneRouting: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse2.sales_details.name}` );
    expect(preSalesUserSummary2.id).toEqual(leadReponse2.sales_details.id);

    // Validate Email routing
    const leadEmailForEmailRouting = await utils.generateRandomEmail();
    await leadAPIUtils.sendIncomingMail(leadEmailForEmailRouting);
    const leadReponse3 = await leadAPIUtils.leadRetrieve(leadEmailForEmailRouting);
    await utils.print(`leadEmailForEmailRouting: ${leadEmailForEmailRouting}`,`Sales name: ${leadReponse3.sales_details.name}` );
    expect(preSalesUserSummary.id).toEqual(leadReponse3.sales_details.id);
    
});

test('Validate normal round robin', async ({ page }) => {

    const numberOfLeadsCreated = 6;
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingPage = new RoutingConfigurationPage(page);
    const notyMessage = new NotyMessage(page);
    const routingSetupPage = new RoutingSetupPage(page);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);

    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const preSalesUserSummary0 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});
    const preSalesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:1});
    const preSalesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:2});

    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(preSalesUserSummary0.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(preSalesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(preSalesUserSummary3.id, true);

    // Reset three sales score to zero
    await routingAPIUtils.resetUserScore(preSalesUserSummary0.id,0);
    await routingAPIUtils.resetUserScore(preSalesUserSummary1.id,1);
    await routingAPIUtils.resetUserScore(preSalesUserSummary3.id,2);


    await loginPage.login(adminUserSummary.email, properties.PASSWORD);

    await settingPage.clickOnRoutingSetup();

    await routingSetupPage.clickOnRoutingConfiguration();

     // Create Rule for whatsApp by two sales
     await routingPage.clickOnCreateNewRule();

     await routingPage.enterRuleName("WhatsApp medium rule with Three sales with round robin")
 
     await routingPage.selectMediumType(mediumType.whatsapp);
 
     await routingPage.selectSalesForRule(preSalesUserSummary0.name);
     await routingPage.selectSalesForRule(preSalesUserSummary1.name);
     await routingPage.selectSalesForRule(preSalesUserSummary3.name);

     await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(preSalesUserSummary0.id,0,0,24,0);
     await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(preSalesUserSummary1.id,0,0,24,0);
     await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(preSalesUserSummary3.id,0,0,24,0);

     await routingPage.selectRoutingStrategyForRule(mediumRoutingStrategy.roundRobin);
 
     await routingPage.clickOnSaveRule();

     const actual4 = await notyMessage.getNotyMessage(true);
 
     expect(actual4).toContain("successfully");

     let countForSales1 = 0;
     let countForSales2 = 0;
     let countForSales3 = 0;

     for (let index = 0; index < numberOfLeadsCreated; index++) {
        const leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
        await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting,"Hello");
        const leadReponse = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
        await utils.print(`leadEmailForPhoneRouting normal round robin: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse.sales_details.name}` );
        if((leadReponse.sales_details.id) === preSalesUserSummary0.id){
            countForSales1++;
        }

        if((leadReponse.sales_details.id) === preSalesUserSummary1.id){
            countForSales2++;
        }

        if((leadReponse.sales_details.id) === preSalesUserSummary3.id){
            countForSales3++;
        }
    }
    expect(`${countForSales1}`).toEqual(`${numberOfLeadsCreated/3}`)
    expect(`${countForSales2}`).toEqual(`${numberOfLeadsCreated/3}`)
    expect(`${countForSales3}`).toEqual(`${numberOfLeadsCreated/3}`)
});

test('Validate weighted round robin', async ({ page }) => {

    const numberOfLeadsCreated = 6;
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingPage = new RoutingConfigurationPage(page);
    const notyMessage = new NotyMessage(page);
    const routingSetupPage = new RoutingSetupPage(page);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);

    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});

    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary3.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);

    await utils.print(`salesUserSummary1: ${salesUserSummary1.name}`,`salesUserSummary2: ${salesUserSummary2.name}`,`salesUserSummary3: ${salesUserSummary3.name}` );

    // Reset three sales score to zero
    await routingAPIUtils.resetUserScore(salesUserSummary1.id,0);
    await routingAPIUtils.resetUserScore(salesUserSummary2.id,1);
    await routingAPIUtils.resetUserScore(salesUserSummary3.id,2);

    await loginPage.login(adminUserSummary.email, properties.PASSWORD);

    await settingPage.clickOnRoutingSetup();

    await routingSetupPage.clickOnRoutingConfiguration();

    await routingPage.selectRoutingStrategy(mediumRoutingStrategy.weightedroundrobin);

    await routingPage.saveRoutingConfiguration();

    const actual = await notyMessage.getNotyMessage(false);

    expect(actual).toEqual("routing configuration updated successfully");

     // Create Rule for whatsApp by two sales
     await routingPage.clickOnCreateNewRule();

     await routingPage.enterRuleName("WhatsApp medium rule with Three sales with weighted round robin")
 
     await routingPage.selectMediumType(mediumType.whatsapp);
 
     await routingPage.selectSalesForRule(salesUserSummary1.name);
     await routingPage.selectSalesForRule(salesUserSummary2.name);
     await routingPage.selectSalesForRule(salesUserSummary3.name);
 
     await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
     await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
     await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);

     await routingPage.clickOnSaveRule();
 
     const actual4 = await notyMessage.getNotyMessage(true);
 
     expect(actual4).toContain("successfully");


     let countForSales1 = 0;
     let countForSales2 = 0;
     let countForSales3 = 0;

     for (let index = 0; index < numberOfLeadsCreated; index++) {
        const leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
        await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting,"Hello");
        const leadReponse = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
        await utils.print(`leadEmailForPhoneRouting weighted round robin: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse.sales_details.name}` );
        if((leadReponse.sales_details.id) === salesUserSummary1.id){
            countForSales1++;
        }

        if((leadReponse.sales_details.id) === salesUserSummary2.id){
            countForSales2++;
        }

        if((leadReponse.sales_details.id) === salesUserSummary3.id){
            countForSales3++;
        }
    }
    expect(`${countForSales1}`).toEqual(`${3}`)
    expect(`${countForSales2}`).toEqual(`${2}`)
    expect(`${countForSales3}`).toEqual(`${1}`)
});

test('Validate call availability for sales', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingPage = new RoutingConfigurationPage(page);
    const notyMessage = new NotyMessage(page);
    const routingSetupPage = new RoutingSetupPage(page);
    const sidePanal = new SidePanal(page);
    const bulkCallAvailabilitiesPage = new BulkCallAvailabilitiesPage(page);
    const manageUserPage = new ManageUserPage(page);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);

    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const preSalesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});
    const preSalesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:1});
    const sellDoClientDetails = await crmAPIUtils.getSellDoClientDetails();

    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(preSalesUserSummary.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(preSalesUserSummary2.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(preSalesUserSummary.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(preSalesUserSummary2.id,0,0,24,0);

    await loginPage.loginWithClientId(properties.SM_00, properties.PASSWORD, sellDoClientDetails.client_id);

    await sidePanal.clickOnSettings();

    await settingPage.clickOnUserManagement();

    await manageUserPage.clickBulkCallAvailabilities();

    await bulkCallAvailabilitiesPage.applyFilterFunnel(salesUserSummary.name);

    const flag = await bulkCallAvailabilitiesPage.tikLeaveFlag(true);

    await bulkCallAvailabilitiesPage.selectFallbackUser(preSalesUserSummary.name);
    
    await bulkCallAvailabilitiesPage.selectFallbackUserReplace(preSalesUserSummary2.name);

    await bulkCallAvailabilitiesPage.clickSaveFallbackUserButton();

    expect(await notyMessage.getNotyMessage(false)).toContain("Call Availabilities saved successfully.");

    expect(await userManagementAPIUtils.getUserRoaster(salesUserSummary.id)).toEqual("na");

    await sidePanal.clickOnSettings();

    await settingPage.clickOnRoutingSetup();

    await routingSetupPage.clickOnRoutingConfiguration();

    await routingPage.clickOnCreateNewRule();

    await routingPage.enterRuleName("Test Rule for call availability")

    await routingPage.selectMediumType(mediumType.whatsapp);

    await routingPage.selectSalesForRule(salesUserSummary.name);

    await routingPage.clickOnSaveRule();
 
    const actual4 = await notyMessage.getNotyMessage(true);

    expect(actual4).toContain("successfully");

    let leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting, "Hello");
    const leadReponse = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
    await utils.print(`leadEmailForPhoneRouting test call availability: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse.sales_details.name}` );
    expect(preSalesUserSummary2.id).toEqual(leadReponse.sales_details.id);

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary.id, true);

    leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting, "Hello");
    const leadReponse2 = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
    await utils.print(`leadEmailForPhoneRouting test call availability: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse2.sales_details.name}` );
    expect(salesUserSummary.id).toEqual(leadReponse2.sales_details.id);

});

test('Validate lead routing by changing routing priority', async () => {

    const source = "001";
    const subSource = "s001";

    const utils = new Utils();
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
   
    const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingConfiguration();
    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id","source","sub_source","medium_type"],["campaign_id","project_id","source","sub_source"],["campaign_id","project_id","source"],["campaign_id","project_id"],["campaign_id"]]');
    
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});
    const salesUserSummary5 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:4});
    const salesUserSummary6 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:5});
    const salesUserSummary7 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:6});
    const salesUserSummary8 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:7});
    const salesUserSummary9 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:8});
    const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:9});
    const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary({index:1});
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
    
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary3.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary4.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary5.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary6.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary7.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary8.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary9.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary4.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary5.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary6.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary7.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary8.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary9.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);

    await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

    // Create rule for only campaign_id
    await routingAPIUtils.createSingleValueRoutingRule(
        "Rule 01 for campaign_id",
        campaignSummary.id,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        salesUserSummary.id,
        salesUserSummary2.id,
        false,
        true, 
        RoutingRuleStrategy.weighted_round_robin
    );

    // Create rule for only campaign_id and project_id
    await routingAPIUtils.createSingleValueRoutingRule(
        "Rule 02 for campaign_id and project_id",
        campaignSummary.id,
        projectSummary.id,
        undefined,
        undefined,
        undefined,
        undefined,
        salesUserSummary3.id,
        salesUserSummary4.id,
        false,
        true,
        RoutingRuleStrategy.weighted_round_robin
    );

     // Create rule for only campaign_id, project_id and source
     await routingAPIUtils.createSingleValueRoutingRule(
        "Rule 03 for campaign_id, project_id and source",
        campaignSummary.id,
        projectSummary.id,
        source,
        undefined,
        undefined,
        undefined,
        salesUserSummary5.id,
        salesUserSummary6.id,
        false,
        true,
        RoutingRuleStrategy.weighted_round_robin
    );

     // Create rule for only campaign_id, project_id, source and sub_source
     await routingAPIUtils.createSingleValueRoutingRule(
        "Rule 04 for campaign_id, project_id, source and sub_source",
        campaignSummary.id,
        projectSummary.id,
        source,
        subSource,
        undefined,
        undefined,
        salesUserSummary7.id,
        salesUserSummary8.id,
        false,
        true,
        RoutingRuleStrategy.weighted_round_robin
    );

    // Create rule for only campaign_id, project_id, source, sub_source and medium_type
    await routingAPIUtils.createSingleValueRoutingRule(
        "Rule 05 for campaign_id, project_id, source, sub_source and medium_type",
        campaignSummary.id,
        projectSummary.id,
        source,
        subSource,
        MediumType.ApiClient,
        undefined,
        salesUserSummary9.id,
        undefined,
        false,
        false,
        RoutingRuleStrategy.weighted_round_robin
    );

    // Create lead for rule fifth combination of rule non NRI combination of rule
    const leadPhoneNumber_01 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01,"" ,"Routing Lead one",source,subSource,projectSummary.id,"","",false,campaignSummary.id);
    const leadReponse01 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01);
    await utils.print(`leadPhoneNumber_01: ${leadPhoneNumber_01}`,`Sales name: ${leadReponse01.sales_details.name}` );
    expect(salesUserSummary9.id).toEqual(leadReponse01.sales_details.id);

    // Create lead for rule fifth combination of rule NRI combination of rule
    const leadPhoneNumber_01_NRI = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01_NRI,"" ,"Routing Lead two",source,subSource,projectSummary.id,"","",true,campaignSummary.id);
    const leadReponse01_NRI = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01_NRI);
    await utils.print(`leadPhoneNumber_01_NRI: ${leadPhoneNumber_01_NRI}`,`Sales name: ${leadReponse01_NRI.sales_details.name}` );
    expect(salesUserSummary9.id).toEqual(leadReponse01_NRI.sales_details.id);

    // # Change routing priority to campaign_id, project_id, source, sub_source
    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id","source","sub_source"],["campaign_id","project_id","source"],["campaign_id","project_id"],["campaign_id"],["campaign_id","project_id","source","sub_source","medium_type"]]');
  
    // Create lead for rule fourth combination of rule non NRI combination of rule
    const leadPhoneNumber_02 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_02,"" ,"Routing Lead three",source,subSource,projectSummary.id,"","",false,campaignSummary.id);
    const leadReponse02 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_02);
    await utils.print(`leadPhoneNumber_02: ${leadPhoneNumber_02}`,`Sales name: ${leadReponse02.sales_details.name}` );
    expect(salesUserSummary7.id).toEqual(leadReponse02.sales_details.id);

    // Create lead for rule fourth combination of rule NRI combination of rule
    const leadPhoneNumber_02_NRI = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_02_NRI,"" ,"Routing Lead four",source,subSource,projectSummary.id,"","",true,campaignSummary.id);
    const leadReponse02_NRI = await leadAPIUtils.leadRetrieve(leadPhoneNumber_02_NRI);
    await utils.print(`leadPhoneNumber_02_NRI: ${leadPhoneNumber_02_NRI}`,`Sales name: ${leadReponse02_NRI.sales_details.name}` );
    expect(salesUserSummary8.id).toEqual(leadReponse02_NRI.sales_details.id);

    // # Change routing priority to campaign_id, project_id, source
    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id","source"],["campaign_id","project_id"],["campaign_id"],["campaign_id","project_id","source","sub_source","medium_type"],["campaign_id","project_id","source","sub_source"]]');
   
    // Create lead for rule third combination of rule non NRI combination of rule
    const leadPhoneNumber_03 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_03,"" ,"Routing Lead five",source,subSource,projectSummary.id,"","",false,campaignSummary.id);
    const leadReponse03 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_03);
    await utils.print(`leadPhoneNumber_03: ${leadPhoneNumber_03}`,`Sales name: ${leadReponse03.sales_details.name}` );
    expect(salesUserSummary5.id).toEqual(leadReponse03.sales_details.id);

    // Create lead for rule third combination of rule NRI combination of rule
    const leadPhoneNumber_03_NRI = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_03_NRI,"" ,"Routing Lead six",source,subSource,projectSummary.id,"","",true,campaignSummary.id);
    const leadReponse03_NRI = await leadAPIUtils.leadRetrieve(leadPhoneNumber_03_NRI);
    await utils.print(`leadPhoneNumber_03_NRI: ${leadPhoneNumber_03_NRI}`,`Sales name: ${leadReponse03_NRI.sales_details.name}` );
    expect(salesUserSummary6.id).toEqual(leadReponse03_NRI.sales_details.id);

    // # Change routing priority to campaign_id, project_id
    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id"],["campaign_id"],["campaign_id","project_id","source","sub_source","medium_type"],["campaign_id","project_id","source","sub_source"],["campaign_id","project_id","source"]]');
    
    // Create lead for rule second combination of rule non NRI combination of rule
    const leadPhoneNumber_04 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_04,"" ,"Routing Lead seven",source,subSource,projectSummary.id,"","",false,campaignSummary.id);
    const leadReponse04 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_04);
    await utils.print(`leadPhoneNumber_04: ${leadPhoneNumber_04}`,`Sales name: ${leadReponse04.sales_details.name}` );
    expect(salesUserSummary3.id).toEqual(leadReponse04.sales_details.id);

    // Create lead for rule second combination of rule NRI combination of rule
    const leadPhoneNumber_04_NRI = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_04_NRI,"" ,"Routing Lead eight",source,subSource,projectSummary.id,"","",true,campaignSummary.id);
    const leadReponse04_NRI = await leadAPIUtils.leadRetrieve(leadPhoneNumber_04_NRI);
    await utils.print(`leadPhoneNumber_04_NRI: ${leadPhoneNumber_04_NRI}`,`Sales name: ${leadReponse04_NRI.sales_details.name}` );
    expect(salesUserSummary4.id).toEqual(leadReponse04_NRI.sales_details.id);

    // # Change routing priority to campaign_id
    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id"],["campaign_id","project_id","source","sub_source","medium_type"],["campaign_id","project_id","source","sub_source"],["campaign_id","project_id","source"],["campaign_id","project_id"]]');

    // Create lead for rule first combination of rule non NRI combination of rule
    const leadPhoneNumber_05 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_05,"" ,"Routing Lead nine",source,subSource,projectSummary.id,"","",false,campaignSummary.id);
    const leadReponse05 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_05);
    await utils.print(`leadPhoneNumber_05: ${leadPhoneNumber_05}`,`Sales name: ${leadReponse05.sales_details.name}` );
    expect(salesUserSummary.id).toEqual(leadReponse05.sales_details.id);

    // Create lead for rule first combination of rule NRI combination of rule
    const leadPhoneNumber_05_NRI = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_05_NRI,"" ,"Routing Lead ten",source,subSource,projectSummary.id,"","",true,campaignSummary.id);
    const leadReponse05_NRI = await leadAPIUtils.leadRetrieve(leadPhoneNumber_05_NRI);
    await utils.print(`leadPhoneNumber_05_NRI: ${leadPhoneNumber_05_NRI}`,`Sales name: ${leadReponse05_NRI.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse05_NRI.sales_details.id);

    // Create lead combination for default rule
    const leadPhoneNumber_06 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_06,"" ,"Routing Lead eleven","","","","","",false);
    const leadReponse06 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_06);
    await utils.print(`leadPhoneNumber_06: ${leadPhoneNumber_06}`,`Sales name: ${leadReponse06.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse06.sales_details.id);

    // Create lead combination for default rule
    const leadPhoneNumber_07 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_07,"" ,"Routing Lead twelve","","","","","",true);
    const leadReponse07 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_07);
    await utils.print(`leadPhoneNumber_07: ${leadPhoneNumber_07}`,`Sales name: ${leadReponse07.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse07.sales_details.id);

});

test('Validate lead routing for re-engagement of rule with non NRI combination of rule', async () => {


    const source01 = "001";
    const source02 = "002";
    const source03 = "003";
    const subSource01 = "s001";
    const subSource02 = "s002";
    const subSource03 = "s003";


    const utils = new Utils();
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingConfiguration();
    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id","source","sub_source","medium_type"]]');

    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});
    const salesUserSummary5 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:4});
    const salesUserSummary6 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:5});
    const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:9});

    const campaignSummary1 = await crmAPIUtils.getFirstActiveCampaignSummary({index:1});
    const campaignSummary2 = await crmAPIUtils.getFirstActiveCampaignSummary({index:2});
    const campaignSummary3 = await crmAPIUtils.getFirstActiveCampaignSummary({index:3});
    const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
    const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});
    const projectSummary03 = await crmAPIUtils.getFirstActiveProjectSummary({index:2});
    
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary3.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary4.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary5.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummary6.id, true);
    await userManagementAPIUtils.saveCallAvailabilitiesForAllDays(salesUserSummaryDefault.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary4.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary5.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary6.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);
    
    await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

    // Create rule for only campaign_id, project_id, source, sub_source and medium_type
    await routingAPIUtils.createSingleValueRoutingRule(
        "Rule 01 for SRD 1",
        campaignSummary1.id,
        projectSummary01.id,
        source01,
        subSource01,
        MediumType.ApiClient,
        undefined,
        salesUserSummary.id,
        salesUserSummary2.id,
        false,
        true,
        RoutingRuleStrategy.weighted_round_robin
    );

     // Create rule for only campaign_id, project_id, source, sub_source and medium_type
     await routingAPIUtils.createSingleValueRoutingRule(
        "Rule 02 for SRD 2",
        campaignSummary2.id,
        projectSummary02.id,
        source02,
        subSource02,
        MediumType.ApiClient,
        undefined,
        salesUserSummary3.id,
        salesUserSummary4.id,
        true,
        true,
        RoutingRuleStrategy.weighted_round_robin
    );

    // Create rule for only campaign_id, project_id, source, sub_source and medium_type
    await routingAPIUtils.createSingleValueRoutingRule(
        "Rule 03 for SRD 3",
        campaignSummary3.id,
        projectSummary03.id,
        source03,
        subSource03,
        MediumType.ApiClient,
        undefined,
        salesUserSummary5.id,
        salesUserSummary6.id,
        false,
        true,
        RoutingRuleStrategy.weighted_round_robin
    );


    // Create lead for rule first combination of rule non NRI combination of rule
    const leadPhoneNumber_01_default = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01_default,"" ,"Routing Lead thirteen","","","","","",false);
    const leadReponse01_default = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01_default);
    await utils.print(`leadPhoneNumber_01_default: ${leadPhoneNumber_01_default}`,`Sales name: ${leadReponse01_default.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse01_default.sales_details.id);

    // Create lead for rule first combination of rule non NRI combination of rule
    const leadPhoneNumber_01 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01,"" ,"Routing Lead fourteen",source01,subSource01,projectSummary01.id,"","",false,campaignSummary1.id);
    const leadReponse01 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01);
    await utils.print(`leadPhoneNumber_01: ${leadPhoneNumber_01}`,`Sales name: ${leadReponse01.sales_details.name}` );
    expect(salesUserSummary.id).toEqual(leadReponse01.sales_details.id);

    // Create lead for rule first combination of rule NRI combination of rule
    const leadPhoneNumber_01_NRI = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01_NRI,"" ,"Routing Lead fifteen",source01,subSource01,projectSummary01.id,"","",true,campaignSummary1.id);
    const leadReponse01_NRI = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01_NRI);
    await utils.print(`leadPhoneNumber_01_NRI: ${leadPhoneNumber_01_NRI}`,`Sales name: ${leadReponse01_NRI.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse01_NRI.sales_details.id);

    // Create lead for rule second combination of rule non NRI combination of rule
    const leadPhoneNumber_02 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_02,"" ,"Routing Lead sixteen",source02,subSource02,projectSummary02.id,"","",false,campaignSummary2.id);
    const leadReponse02 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_02);
    await utils.print(`leadPhoneNumber_02: ${leadPhoneNumber_02}`,`Sales name: ${leadReponse02.sales_details.name}` );
    expect(salesUserSummary3.id).toEqual(leadReponse02.sales_details.id);

    // Create lead for rule second combination of rule NRI combination of rule
    const leadPhoneNumber_02_NRI = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_02_NRI,"" ,"Routing Lead seventeen",source02,subSource02,projectSummary02.id,"","",true,campaignSummary2.id);
    const leadReponse02_NRI = await leadAPIUtils.leadRetrieve(leadPhoneNumber_02_NRI);
    await utils.print(`leadPhoneNumber_02_NRI: ${leadPhoneNumber_02_NRI}`,`Sales name: ${leadReponse02_NRI.sales_details.name}` );
    expect(salesUserSummary4.id).toEqual(leadReponse02_NRI.sales_details.id);

    // Create lead for rule third combination of rule non NRI combination of rule
    const leadPhoneNumber_03 = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_03,"" ,"Routing Lead eighteen",source03,subSource03,projectSummary03.id,"","",false,campaignSummary3.id);
    const leadReponse03 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_03);
    await utils.print(`leadPhoneNumber_03: ${leadPhoneNumber_03}`,`Sales name: ${leadReponse03.sales_details.name}` );
    expect(salesUserSummary5.id).toEqual(leadReponse03.sales_details.id);

    // Create lead for rule third combination of rule NRI combination of rule
    const leadPhoneNumber_03_NRI = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_03_NRI,"" ,"Routing Lead nineteen",source03,subSource03,projectSummary03.id,"","",true,campaignSummary3.id);
    const leadReponse03_NRI = await leadAPIUtils.leadRetrieve(leadPhoneNumber_03_NRI);
    await utils.print(`leadPhoneNumber_03_NRI: ${leadPhoneNumber_03_NRI}`,`Sales name: ${leadReponse03_NRI.sales_details.name}` );
    expect(salesUserSummary6.id).toEqual(leadReponse03_NRI.sales_details.id);

    // #1 Re-engagement of rule with non NRI combination  
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01,"" ,"Routing Lead twenty",source02,subSource02,projectSummary02.id,"","",true,campaignSummary2.id);
    const leadReponse04 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01);
    await utils.print(`leadPhoneNumber_01: ${leadPhoneNumber_01}`,`Sales name: ${leadReponse04.sales_details.name}` );
    expect(salesUserSummary.id).toEqual(leadReponse04.sales_details.id);

    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01_NRI,"" ,"Routing Lead twenty one",source02,subSource02,projectSummary02.id,"","",false,campaignSummary2.id);
    const leadReponse05 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01_NRI);
    await utils.print(`leadPhoneNumber_01_NRI: ${leadPhoneNumber_01_NRI}`,`Sales name: ${leadReponse05.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse05.sales_details.id);

    // #2 Re-engagement of rule with non NRI combination  
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_02,"" ,"Routing Lead twenty two",source03,subSource03,projectSummary03.id,"","",true,campaignSummary3.id);
    const leadReponse06 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_02);
    await utils.print(`leadPhoneNumber_02: ${leadPhoneNumber_02}`,`Sales name: ${leadReponse06.sales_details.name}` );
    expect(salesUserSummary6.id).toEqual(leadReponse06.sales_details.id);

    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_02_NRI,"" ,"Routing Lead twenty three",source03,subSource03,projectSummary03.id,"","",false,campaignSummary3.id);
    const leadReponse07 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_02_NRI);
    await utils.print(`leadPhoneNumber_02_NRI: ${leadPhoneNumber_02_NRI}`,`Sales name: ${leadReponse07.sales_details.name}` );
    expect(salesUserSummary6.id).toEqual(leadReponse07.sales_details.id);

    // #3 Re-engagement of rule with non NRI combination  
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_03,"" ,"Routing Lead twenty four",source01,subSource01,projectSummary01.id,"","",true,campaignSummary1.id);
    const leadReponse08 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_03);
    await utils.print(`leadPhoneNumber_03: ${leadPhoneNumber_03}`,`Sales name: ${leadReponse08.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse08.sales_details.id);

    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_03_NRI,"" ,"Routing Lead twenty five",source01,subSource01,projectSummary01.id,"","",false,campaignSummary1.id);
    const leadReponse09 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_03_NRI);
    await utils.print(`leadPhoneNumber_03_NRI: ${leadPhoneNumber_03_NRI}`,`Sales name: ${leadReponse09.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse09.sales_details.id);

    // #4 Re-engagement of rule with non NRI combination 
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01_default,"" ,"Routing Lead twenty six",source01,subSource01,projectSummary01.id,"","",false,campaignSummary1.id);
    const leadReponse10 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01_default);
    await utils.print(`leadPhoneNumber_01_default: ${leadPhoneNumber_01_default}`,`Sales name: ${leadReponse10.sales_details.name}` );
    expect(salesUserSummary.id).toEqual(leadReponse10.sales_details.id);
    
    await leadAPIUtils.createLeadWithDetails(leadPhoneNumber_01,"" ,"Routing Lead twenty six",source01,subSource01,projectSummary01.id,"","",false,campaignSummary1.id);
    const leadReponse11 = await leadAPIUtils.leadRetrieve(leadPhoneNumber_01);
    await utils.print(`leadPhoneNumber_01: ${leadPhoneNumber_01}`,`Sales name: ${leadReponse11.sales_details.name}` );
    expect(salesUserSummary.id).toEqual(leadReponse11.sales_details.id); 
});

test.fixme('Validatsse lead routing for re-engagement of rule with NRI combination of rule', async () => {

    const utils = new Utils();

    const campaignAPIUtils = new CampaignAPIUtils(clientId, fullAccessAPI);
    const inventoryCreator = new InventoryCreator(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary({index:0});
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
  //  const preSalesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.PreSales,{index:0});

    const developerName = `Developer ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
    const developerId = await inventoryCreator.createDeveloper(developerName);

    const projectName = `Project ${await utils.generateRandomString(8, { casing: "lower", includeNumbers: true, includeSpecialChars: false })}`;
    const projectId = (await inventoryCreator.createProject(projectName, developerId, salesUserSummary.id, "", false)).id;

    const srdId = await campaignAPIUtils.createSRD({
        entityType: "ApiClient",
        campaignApiRuleId: campaignSummary.id,
        entityId: "69035d71b08345742ff61269",
        campaign: campaignSummary.name,
        projectId: projectId,
        source: "001",
        subSource: "s001",
    });

    console.log(`srdId: ${srdId}`);


});