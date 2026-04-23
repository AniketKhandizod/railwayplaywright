import { test, expect } from '@playwright/test';
import { properties } from "../../../properties/v2.ts";
import { Utils } from "../../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../../pages/CommonPages/loginPage.ts";
import { SettingPage } from '../../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts';
import { LeadAPIUtils } from '../../../utils/APIUtils/LeadAPIUtils.ts';
import { RoutingAPIUtils } from '../../../utils/APIUtils/RoutingAPIUtils.ts';
import { NotyMessage } from '../../../pages/AdminAndSupportPages/NotyMessage.ts';
import { SidePanal } from '../../../pages/AdminAndSupportPages/SidePanal.ts';
import { BulkCallAvailabilitiesPage } from '../../../pages/AdminAndSupportPages/UserManagementPages/BulkCallAvailabilitiesPage.ts';
import { ManageUserPage } from '../../../pages/AdminAndSupportPages/UserManagementPages/ManageUserPage.ts';
import { UserManagementAPIUtils } from '../../../utils/APIUtils/UserManagementAPIUtils.ts';
import { MediumType, RoutingRuleStrategy } from '../../../utils/APIUtils/RoutingAPIUtils.ts';
import { CRMAPIUtils, UserRoleFilter } from '../../../utils/APIUtils/CRMAPIUtils.ts';

const clientId = properties.New_Routing_Client_Id;
const fullAccessAPI = properties.New_Routing_Client_FullAccess_API;
const restrictedAccessAPI = properties.New_Routing_Client_RestrictedAccess_API;

test.describe.configure({ mode: "serial"});
// timeout 5 minutes
test.setTimeout(15 * 60 * 1000);
test.beforeEach(async () => {
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingConfiguration();
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    await userManagementAPIUtils.markAllUsersAsAvailable();
});

test('Validate lead routing and assignment of lead', async () => {

    const utils = new Utils();
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);

    // Create Rule for API
    await routingAPIUtils.createRoutingRule(
      "API",
      undefined,
      undefined,
      undefined,
      undefined,
      MediumType.ApiClient,
      undefined,
      [salesUserSummary1.id]
    );

    // Create Rule for email
    await routingAPIUtils.createRoutingRule(
      "Email",
      undefined,
      undefined,
      undefined,
      undefined,
      MediumType.Email,
      undefined,
      [salesUserSummary2.id]
    );

    // Create Rule for whatsApp
    await routingAPIUtils.createRoutingRule(
      "WhatsApp",
      undefined,
      undefined,
      undefined,
      undefined,
      MediumType.Whatsapp,
      undefined,
      [salesUserSummary3.id]
    );

     // Validate API routing
     const leadEmail = await utils.generateRandomEmail();
     await leadAPIUtils.createLeadWithDetails("",leadEmail ,"Routing Lead one","","","","","");
     const leadReponse = await leadAPIUtils.leadRetrieve(leadEmail);
     await utils.print(`leadEmail for API routing: ${leadEmail}`,`Sales name: ${leadReponse.sales_details.name}` );
     expect(salesUserSummary1.id).toEqual(leadReponse.sales_details.id);
     
     // Validate Email routing
     const leadEmailForEmailRouting = await utils.generateRandomEmail();
     await leadAPIUtils.sendIncomingMail(leadEmailForEmailRouting);
     const leadReponse3 = await leadAPIUtils.leadRetrieve(leadEmailForEmailRouting);
     await utils.print(`leadEmail for Email routing: ${leadEmailForEmailRouting}`,`Sales name: ${leadReponse3.sales_details.name}` );
     expect(salesUserSummary2.id).toEqual(leadReponse3.sales_details.id);
     
     // Validate WhatsApp routin
     const leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
     await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting,"Hello");
     const leadReponse2 = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
     await utils.print(`leadEmail for WhatsApp routing: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse2.sales_details.name}` );
     expect(salesUserSummary3.id).toEqual(leadReponse2.sales_details.id);
    
});

test('Validate normal round robin', async () => {

    const numberOfLeadsCreated = 6;
    const utils = new Utils();
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);

    // Reset three sales score to zero
    await routingAPIUtils.resetUserScore(salesUserSummary1.id,3);
    await routingAPIUtils.resetUserScore(salesUserSummary2.id,1);
    await routingAPIUtils.resetUserScore(salesUserSummary3.id,2);
    

     // Create Rule for whatsApp by three sales with round robin
     await routingAPIUtils.createRoutingRule(
       "WhatsApp medium rule with Three sales with round robin",
       undefined,
       undefined,
       undefined,
       undefined,
       MediumType.Whatsapp,
       undefined,
       [salesUserSummary1.id, salesUserSummary2.id, salesUserSummary3.id],
       undefined,
       false,
       false,
       RoutingRuleStrategy.round_robin
     );

     let countForSales1 = 0;
     let countForSales2 = 0;
     let countForSales3 = 0;

     for (let index = 0; index < numberOfLeadsCreated; index++) {
        const leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
        await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting,"Hello");
        const leadReponse = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
        await utils.print(`leadEmailForPhoneRouting normal round robin: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse.sales_details.name}` );
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
    expect(`${countForSales1}`).toEqual(`${numberOfLeadsCreated/3}`)
    expect(`${countForSales2}`).toEqual(`${numberOfLeadsCreated/3}`)
    expect(`${countForSales3}`).toEqual(`${numberOfLeadsCreated/3}`)

});

test('Validate weighted round robin by changing user score', async () => {

      const numberOfLeadsCreated = 6;
      const utils = new Utils();
      const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
      const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
      const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
      const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

      const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
      const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
      const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
      
      await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
      await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
      await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);

      await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
      await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
      await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);

      // Reset three sales score to zero
      await routingAPIUtils.resetUserScore(salesUserSummary1.id,3);
      await routingAPIUtils.resetUserScore(salesUserSummary2.id,1);
      await routingAPIUtils.resetUserScore(salesUserSummary3.id,2);

      // Create Rule for whatsApp by three sales with weighted round robin
      await routingAPIUtils.createRoutingRule(
        "WhatsApp medium rule with Three sales with weighted round robin",
        undefined,
        undefined,
        undefined,
        undefined,
        MediumType.Whatsapp,
        undefined,
        [salesUserSummary1.id, salesUserSummary2.id, salesUserSummary3.id]
      );

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
      expect(`${countForSales1}`).toEqual(`${1}`)
      expect(`${countForSales2}`).toEqual(`${3}`)
      expect(`${countForSales3}`).toEqual(`${2}`)
});

test('Validate call availability for sales', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const notyMessage = new NotyMessage(page);
    const sidePanal = new SidePanal(page);
    const bulkCallAvailabilitiesPage = new BulkCallAvailabilitiesPage(page);
    const manageUserPage = new ManageUserPage(page);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);

    // Reset three sales score to zero
    await routingAPIUtils.resetUserScore(salesUserSummary1.id,0);
    await routingAPIUtils.resetUserScore(salesUserSummary2.id,0);
    await routingAPIUtils.resetUserScore(salesUserSummary3.id,0);

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);

    await loginPage.loginWithClientId(properties.SM_00, properties.PASSWORD, clientId);

    await sidePanal.clickOnSettings();

    await settingPage.clickOnUserManagement();

    await manageUserPage.clickBulkCallAvailabilities();

    await bulkCallAvailabilitiesPage.applyFilterFunnel(salesUserSummary1.name);

    const flag = await bulkCallAvailabilitiesPage.tikLeaveFlag(true);

    await bulkCallAvailabilitiesPage.selectFallbackUser(salesUserSummary2.name);
    
    await bulkCallAvailabilitiesPage.selectFallbackUserReplace(salesUserSummary3.name);

    await bulkCallAvailabilitiesPage.clickSaveFallbackUserButton();

    expect(await notyMessage.getNotyMessage(false)).toContain("Call Availabilities saved successfully.");

    expect(await userManagementAPIUtils.getUserRoaster(salesUserSummary1.id)).toEqual("na");

    await routingAPIUtils.createRoutingRule(
      "Test Rule for call availability",
      undefined,
      undefined,
      undefined,
      undefined,
      MediumType.Whatsapp,
      undefined,
      [salesUserSummary1.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    let leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting, "Hello");
    const leadReponse = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
    await utils.print(`leadEmailForPhoneRouting call availability for sales: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse.sales_details.name}` );
    expect(salesUserSummary3.id).toEqual(leadReponse.sales_details.id);

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);

    leadEmailForPhoneRouting = await utils.generateRandomPhoneNumber();
    await leadAPIUtils.incomingWhatsapp_ADZ(leadEmailForPhoneRouting, "Hello");
    const leadReponse2 = await leadAPIUtils.leadRetrieve(leadEmailForPhoneRouting);
    await utils.print(`leadEmailForPhoneRouting call availability for sales: ${leadEmailForPhoneRouting}`,`Sales name: ${leadReponse2.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse2.sales_details.id);

});

test('Validate lead routing for multiple projects', async () => {

    const utils = new Utils();
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});

    const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
    const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});
    const projectSummary03 = await crmAPIUtils.getFirstActiveProjectSummary({index:2});
    const projectSummary04 = await crmAPIUtils.getFirstActiveProjectSummary({index:3});
    const projectSummary05 = await crmAPIUtils.getFirstActiveProjectSummary({index:4});
    const projectSummary06 = await crmAPIUtils.getFirstActiveProjectSummary({index:5});
    const projectSummary07 = await crmAPIUtils.getFirstActiveProjectSummary({index:6});
    const projectSummary08 = await crmAPIUtils.getFirstActiveProjectSummary({index:7});
    const projectSummary09 = await crmAPIUtils.getFirstActiveProjectSummary({index:8});

    const campaignSummary01 = await crmAPIUtils.getFirstActiveCampaignSummary({index:0});

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummaryDefault.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);

    // Reset three sales score to zero
    await routingAPIUtils.resetUserScore(salesUserSummary1.id,0);
    await routingAPIUtils.resetUserScore(salesUserSummary2.id,0);
    await routingAPIUtils.resetUserScore(salesUserSummary3.id,0);

    // delete all rules and update default rule
    const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["project_id"]]');

    // Create Rule for API
    await routingAPIUtils.createRoutingRule(
      "Rule 01",
      undefined,
      [projectSummary01.id, projectSummary02.id, projectSummary03.id],
      undefined,
      undefined,
      undefined,
      undefined,
      [salesUserSummary1.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for email
    await routingAPIUtils.createRoutingRule(
      "Rule 02",
      undefined,
      [projectSummary04.id, projectSummary05.id, projectSummary06.id],
      undefined,
      undefined,
      undefined,
      undefined,
      [salesUserSummary2.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for whatsApp
    await routingAPIUtils.createRoutingRule(
      "Rule 03",
      undefined,
      [projectSummary07.id, projectSummary08.id, projectSummary09.id],
      undefined,
      undefined,
      undefined,
      undefined,
      [salesUserSummary3.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Validate for default rule
    const leadEmail = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail ,"Routing Lead two","","","","","");
    const leadReponse = await leadAPIUtils.leadRetrieve(leadEmail);
    await utils.print(`leadEmail lead routing for multiple projects: ${leadEmail}`,`Sales name: ${leadReponse.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse.sales_details.id);

    // Validate for default rule 01
    const projectId = [projectSummary01.id, projectSummary02.id, projectSummary03.id];
    const leadEmail01 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead three","","",projectId,"","");
    const leadReponse01 = await leadAPIUtils.leadRetrieve(leadEmail01);
    await utils.print(`leadEmail01 lead routing for multiple projects: ${leadEmail01}`,`Sales name: ${leadReponse01.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse01.sales_details.id);

    // Validate for default rule 02
    const projectId02 = [projectSummary04.id, projectSummary05.id, projectSummary06.id];
    const leadEmail02 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead four","","",projectId02,"","");
    const leadReponse02 = await leadAPIUtils.leadRetrieve(leadEmail02);
    await utils.print(`leadEmail02 lead routing for multiple projects: ${leadEmail02}`,`Sales name: ${leadReponse02.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse02.sales_details.id);

    // Validate for default rule 03
    const projectId03 = [projectSummary07.id, projectSummary08.id, projectSummary09.id];
    const leadEmail03 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail03 ,"Routing Lead five","","",projectId03,"","");
    const leadReponse03 = await leadAPIUtils.leadRetrieve(leadEmail03);
    await utils.print(`leadEmail03 lead routing for multiple projects: ${leadEmail03}`,`Sales name: ${leadReponse03.sales_details.name}` );
    expect(salesUserSummary3.id).toEqual(leadReponse03.sales_details.id);

    // Validate for first combination of rule
    const projectId04 = [projectSummary01.id, projectSummary07.id, projectSummary08.id, projectSummary09.id];
    const leadEmail04 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead six","","",projectId04,"","");
    const leadReponse04 = await leadAPIUtils.leadRetrieve(leadEmail04);
    await utils.print(`leadEmail04 lead routing for multiple projects: ${leadEmail04}`,`Sales name: ${leadReponse04.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse04.sales_details.id);

    // Validate for second combination of rule
    const projectId05 = [projectSummary09.id, projectSummary02.id, projectSummary03.id];
    const leadEmail05 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail05 ,"Routing Lead seven","","",projectId05,"","");
    const leadReponse05 = await leadAPIUtils.leadRetrieve(leadEmail05);
    await utils.print(`leadEmail05 lead routing for multiple projects: ${leadEmail05}`,`Sales name: ${leadReponse05.sales_details.name}` );
    expect(salesUserSummary3.id).toEqual(leadReponse05.sales_details.id);

    // Validate for third combination of rule
    const projectId06 = [projectSummary04.id, projectSummary09.id, projectSummary01.id];
    const leadEmail06 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail06 ,"Routing Lead eight","","",projectId06,"","");
    const leadReponse06 = await leadAPIUtils.leadRetrieve(leadEmail06);
    await utils.print(`leadEmail06 lead routing for multiple projects: ${leadEmail06}`,`Sales name: ${leadReponse06.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse06.sales_details.id);

    // Validate for re-engagement combination of rule
    const projectId07 = [projectSummary01.id, projectSummary09.id, projectSummary01.id];
    await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead nine","s100","s100",projectId07,"","",false,campaignSummary01.id);
    const leadReponse07 = await leadAPIUtils.leadRetrieve(leadEmail02);
    await utils.print(`leadEmail07 lead routing for multiple projects re-engagement: ${leadEmail02}`,`Sales name: ${leadReponse07.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse07.sales_details.id);

});

test('Validate lead routing for multiple sources and project at same priority', async () => {

    const utils = new Utils();
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);

    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});

    const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
    const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});
    const projectSummary03 = await crmAPIUtils.getFirstActiveProjectSummary({index:2});
    const projectSummary04 = await crmAPIUtils.getFirstActiveProjectSummary({index:3});
    const projectSummary05 = await crmAPIUtils.getFirstActiveProjectSummary({index:4});
    const projectSummary06 = await crmAPIUtils.getFirstActiveProjectSummary({index:5});
    const projectSummary07 = await crmAPIUtils.getFirstActiveProjectSummary({index:6});
    const projectSummary08 = await crmAPIUtils.getFirstActiveProjectSummary({index:7});
    const projectSummary09 = await crmAPIUtils.getFirstActiveProjectSummary({index:8});

    const source01 = (await crmAPIUtils.dataProvider_Source({ index: 1 })).id;
    const source02 = (await crmAPIUtils.dataProvider_Source({ index: 2 })).id;
    const source03 = (await crmAPIUtils.dataProvider_Source({ index: 3 })).id;
    const source04 = (await crmAPIUtils.dataProvider_Source({ index: 4 })).id;
    const source05 = (await crmAPIUtils.dataProvider_Source({ index: 5 })).id;
    const source06 = (await crmAPIUtils.dataProvider_Source({ index: 6 })).id;
    const source07 = (await crmAPIUtils.dataProvider_Source({ index: 7 })).id;
    const source08 = (await crmAPIUtils.dataProvider_Source({ index: 8 })).id;
    const source09 = (await crmAPIUtils.dataProvider_Source({ index: 9 })).id;

    const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["project_id","source"]]');

    // Create Rule for API
    await routingAPIUtils.createRoutingRule(
      "Rule 01",
      undefined,
      [projectSummary01.id, projectSummary02.id, projectSummary03.id],
      [source01, source02, source03],
      undefined,
      undefined,
      undefined,
      [salesUserSummary1.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for email
    await routingAPIUtils.createRoutingRule(
      "Rule 02",
      undefined,
      [projectSummary04.id, projectSummary05.id, projectSummary06.id],
      [source04, source05, source06],
      undefined,
      undefined,
      undefined,
      [salesUserSummary2.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for whatsApp
    await routingAPIUtils.createRoutingRule(
      "Rule 03",
      undefined,
      [projectSummary07.id, projectSummary08.id, projectSummary09.id],
      [source07, source08, source09],
      undefined,
      undefined,
      undefined,
      [salesUserSummary3.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Validate for default rule
    const leadEmail = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail ,"Routing Lead eleven","","","","","");
    const leadReponse = await leadAPIUtils.leadRetrieve(leadEmail);
    await utils.print(`leadEmail lead routing for multiple sources and project at same priority: ${leadEmail}`,`Sales name: ${leadReponse.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse.sales_details.id);

    // Validate for default rule 01
    const projectId = [projectSummary01.id, projectSummary02.id, projectSummary03.id];
    const leadEmail01 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead twelve",source01,"",projectId,"","");
    const leadReponse01 = await leadAPIUtils.leadRetrieve(leadEmail01);
    await utils.print(`leadEmail01 lead routing for multiple sources and project at same priority: ${leadEmail01}`,`Sales name: ${leadReponse01.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse01.sales_details.id);

    // Validate for default rule 02
    const projectId02 = [projectSummary04.id, projectSummary05.id, projectSummary06.id];
    const leadEmail02 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead thirteen",source04,"",projectId02,"","");
    const leadReponse02 = await leadAPIUtils.leadRetrieve(leadEmail02);
    await utils.print(`leadEmail02 lead routing for multiple sources and project at same priority: ${leadEmail02}`,`Sales name: ${leadReponse02.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse02.sales_details.id);

    // Validate for default rule 03
    const projectId03 = [projectSummary07.id, projectSummary08.id, projectSummary09.id];
    const leadEmail03 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail03 ,"Routing Lead fourteen",source07,"",projectId03,"","");
    const leadReponse03 = await leadAPIUtils.leadRetrieve(leadEmail03);
    await utils.print(`leadEmail03 lead routing for multiple sources and project at same priority: ${leadEmail03}`,`Sales name: ${leadReponse03.sales_details.name}` );
    expect(salesUserSummary3.id).toEqual(leadReponse03.sales_details.id);

    // Validate for first combination of rule
    const projectId04 = [projectSummary01.id, projectSummary07.id, projectSummary08.id, projectSummary09.id];
    const leadEmail04 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead fifteen",source01,"",projectId04,"","");
    const leadReponse04 = await leadAPIUtils.leadRetrieve(leadEmail04);
    await utils.print(`leadEmail04 lead routing for multiple sources and project at same priority: ${leadEmail04}`,`Sales name: ${leadReponse04.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse04.sales_details.id);

    // Validate for second combination of rule
    const projectId05 = [projectSummary09.id, projectSummary02.id, projectSummary03.id];
    const leadEmail05 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail05 ,"Routing Lead sixteen",source01,"",projectId05,"","");
    const leadReponse05 = await leadAPIUtils.leadRetrieve(leadEmail05);
    await utils.print(`leadEmail05 lead routing for multiple sources and project at same priority: ${leadEmail05}`,`Sales name: ${leadReponse05.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse05.sales_details.id);

    // Validate for third combination of rule
    const projectId06 = [projectSummary04.id, projectSummary09.id, projectSummary01.id];
    const leadEmail06 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail06 ,"Routing Lead seventeen",source05,"",projectId06,"","");
    const leadReponse06 = await leadAPIUtils.leadRetrieve(leadEmail06);
    await utils.print(`leadEmail06 lead routing for multiple sources and project at same priority: ${leadEmail06}`,`Sales name: ${leadReponse06.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse06.sales_details.id);

    // Validate for re-engagement combination of rule
    const projectId07 = [projectSummary01.id, projectSummary09.id, projectSummary01.id];
    await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead eighteen",source07,"devon",projectId07,"","");
    const leadReponse07 = await leadAPIUtils.leadRetrieve(leadEmail02);
    await utils.print(`leadEmail07 lead routing for multiple sources and project at same priority re-engagement: ${leadEmail02}`,`Sales name: ${leadReponse07.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse07.sales_details.id);

     // Validate for re-engagement combination of rule
     const projectId08 = [projectSummary04.id, projectSummary09.id, projectSummary01.id];
     await leadAPIUtils.createLeadWithDetails("",leadEmail03 ,"Routing Lead nineteen",source04,"devon",projectId08,"","");
     const leadReponse08 = await leadAPIUtils.leadRetrieve(leadEmail03);
     await utils.print(`leadEmail08 lead routing for multiple sources and project at same priority re-engagement: ${leadEmail03}`,`Sales name: ${leadReponse08.sales_details.name}` );
     expect(salesUserSummary2.id).toEqual(leadReponse08.sales_details.id);

});

test('Validate lead routing for multiple projects and sources at different priority', async () => {

    const utils = new Utils();
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);

    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});

    const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
    const projectSummary04 = await crmAPIUtils.getFirstActiveProjectSummary({index:3});
    const projectSummary05 = await crmAPIUtils.getFirstActiveProjectSummary({index:4});
    const projectSummary06 = await crmAPIUtils.getFirstActiveProjectSummary({index:5});

    const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);

    const source01 = (await crmAPIUtils.dataProvider_Source({ index: 1 })).id;
    const source02 = (await crmAPIUtils.dataProvider_Source({ index: 2 })).id;
    const source03 = (await crmAPIUtils.dataProvider_Source({ index: 3 })).id;
    const source04 = (await crmAPIUtils.dataProvider_Source({ index: 4 })).id;
    const source05 = (await crmAPIUtils.dataProvider_Source({ index: 5 })).id;
    const source06 = (await crmAPIUtils.dataProvider_Source({ index: 6 })).id;
    const source07 = (await crmAPIUtils.dataProvider_Source({ index: 7 })).id;
    const source08 = (await crmAPIUtils.dataProvider_Source({ index: 8 })).id;
    const source09 = (await crmAPIUtils.dataProvider_Source({ index: 9 })).id;

    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["project_id"],["source"]]');

    // Create Rule for API
    await routingAPIUtils.createRoutingRule(
      "Rule 01",
      undefined,
      undefined,
      [source01, source02, source03],
      undefined,
      undefined,
      undefined,
      [salesUserSummary1.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for email
    await routingAPIUtils.createRoutingRule(
      "Rule 02",
      undefined,
      [projectSummary04.id, projectSummary05.id, projectSummary06.id],
      [source04, source05, source06],
      undefined,
      undefined,
      undefined,
      [salesUserSummary2.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for whatsApp
    await routingAPIUtils.createRoutingRule(
      "Rule 03",
      undefined,
      undefined,
      [source07, source08, source09],
      undefined,
      undefined,
      undefined,
      [salesUserSummary3.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create normal lead for re-engagement combination of rule
    const leadEmail01 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead nineteen","","","","","");

    // Validate for default rule
    const leadEmail = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail ,"Routing Lead twenty","","","","","");
    const leadReponse = await leadAPIUtils.leadRetrieve(leadEmail);
    await utils.print(`leadEmail lead routing for multiple projects and sources at different priority: ${leadEmail}`,`Sales name: ${leadReponse.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse.sales_details.id);

    // Validate for first combination of rule
    const leadEmail02 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead twenty one",source01,"","","","");
    const leadReponse02 = await leadAPIUtils.leadRetrieve(leadEmail02);
    await utils.print(`leadEmail02 lead routing for multiple projects and sources at different priority: ${leadEmail02}`,`Sales name: ${leadReponse02.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse02.sales_details.id);

    // Validate for default rule 03
    const leadEmail03 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail03 ,"Routing Lead twenty two",source03,"",projectSummary04.id,"","");
    const leadReponse03 = await leadAPIUtils.leadRetrieve(leadEmail03);
    await utils.print(`leadEmail03 lead routing for multiple projects and sources at different priority: ${leadEmail03}`,`Sales name: ${leadReponse03.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse03.sales_details.id);

    // Validate for re-engagement combination of rule
    await leadAPIUtils.createLeadWithDetails("",leadEmail ,"Routing Lead twenty three",source07,"devon","","","");
    const leadReponse07 = await leadAPIUtils.leadRetrieve(leadEmail);
    await utils.print(`leadEmail lead routing for multiple projects and sources at different priority re-engagement: ${leadEmail}`,`Sales name: ${leadReponse07.sales_details.name}` );
    expect(salesUserSummary3.id).toEqual(leadReponse07.sales_details.id);

    // Change routing priority to project_id and source
    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["project_id","source"]]');
   
    // Validate for default rule 03
    const leadEmail04 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead twenty four",source06,"",projectSummary06.id,"","");
    const leadReponse04 = await leadAPIUtils.leadRetrieve(leadEmail04);
    await utils.print(`leadEmail04 lead routing for multiple projects and sources at different priority: ${leadEmail04}`,`Sales name: ${leadReponse04.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse04.sales_details.id);

    // Validate for first combination of rule
    const leadEmail05 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail05 ,"Routing Lead twenty five",source01,"",projectSummary01.id,"","");
    const leadReponse05 = await leadAPIUtils.leadRetrieve(leadEmail05);
    await utils.print(`leadEmail05 lead routing for multiple projects and sources at different priority: ${leadEmail05}`,`Sales name: ${leadReponse05.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse05.sales_details.id);

    // Validate for re-engagement combination of rule
    await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead twenty six",source04,"devon",projectSummary06.id,"","");
    const leadReponse08 = await leadAPIUtils.leadRetrieve(leadEmail01);
    await utils.print(`leadEmail08 lead routing for multiple projects and sources at different priority re-engagement: ${leadEmail01}`,`Sales name: ${leadReponse08.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse08.sales_details.id);

});

test('Validate lead routing for multiple projects and sources at different priority and campaign, project, source, sub_source', async () => {

    const utils = new Utils();
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});
    const salesUserSummary5 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:4});
    const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:5});

    const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
    const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});
    const projectSummary03 = await crmAPIUtils.getFirstActiveProjectSummary({index:2});
    const projectSummary04 = await crmAPIUtils.getFirstActiveProjectSummary({index:3});
    const projectSummary05 = await crmAPIUtils.getFirstActiveProjectSummary({index:4});
    const projectSummary06 = await crmAPIUtils.getFirstActiveProjectSummary({index:5});

    const campaignSummary01 = await crmAPIUtils.getFirstActiveCampaignSummary({index:0});
    const campaignSummary02 = await crmAPIUtils.getFirstActiveCampaignSummary({index:1});

    const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary4.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary5.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummaryDefault.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary4.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary5.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);

    const source01 = (await crmAPIUtils.dataProvider_Source({ index: 1 })).id;
    const source02 = (await crmAPIUtils.dataProvider_Source({ index: 2 })).id;
    const source03 = (await crmAPIUtils.dataProvider_Source({ index: 3 })).id;
    const source04 = (await crmAPIUtils.dataProvider_Source({ index: 4 })).id;
    const source06 = (await crmAPIUtils.dataProvider_Source({ index: 5 })).id;

    const subSource01 = (await crmAPIUtils.dataProvider_SubSource({ index: 1 })).id;
    const subSource02 = (await crmAPIUtils.dataProvider_SubSource({ index: 2 })).id;
    const subSource03 = (await crmAPIUtils.dataProvider_SubSource({ index: 3 })).id;
    const subSource04 = (await crmAPIUtils.dataProvider_SubSource({ index: 4 })).id;
    const subSource05 = (await crmAPIUtils.dataProvider_SubSource({ index: 5 })).id;

    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id","source","sub_source"]]');

    // Create Rule for first combination of rule
    await routingAPIUtils.createRoutingRule(
      "Rule 01",
      [campaignSummary01.id, campaignSummary02.id],
      [projectSummary01.id, projectSummary02.id],
      [source01, source02],
      [subSource01, subSource02],
      undefined,
      undefined,
      [salesUserSummary1.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for second combination of rule
    await routingAPIUtils.createRoutingRule(
      "Rule 02",
      [campaignSummary01.id, campaignSummary02.id],
      [projectSummary03.id, projectSummary04.id],
      [source03, source04],
      [subSource03, subSource04],
      undefined,
      undefined,
      [salesUserSummary2.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for third combination of rule
    await routingAPIUtils.createRoutingRule(
      "Rule 03",
      [campaignSummary01.id, campaignSummary02.id],
      [projectSummary03.id, projectSummary04.id],
      [source03, source04],
      undefined,
      undefined,
      undefined,
      [salesUserSummary3.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for fourth combination of rule
    await routingAPIUtils.createRoutingRule(
      "Rule 04",
      [campaignSummary01.id, campaignSummary02.id],
      [projectSummary03.id, projectSummary06.id],
      [source03, source06],
      undefined,
      undefined,
      undefined,
      [salesUserSummary4.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for fifth combination of rule
    await routingAPIUtils.createRoutingRule(
      "Rule 05",
      [campaignSummary02.id],
      [projectSummary03.id, projectSummary05.id],
      [source02, source03],
      [subSource02, subSource03],
      undefined,
      undefined,
      [salesUserSummary5.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Validate for first combination of rule
    const leadEmail04 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead",source01,subSource02,projectSummary01.id,"","",false,campaignSummary02.id);
    const leadReponse04 = await leadAPIUtils.leadRetrieve(leadEmail04);
    await utils.print(`Lead created with source: ${source01} and subSource: ${subSource02} and project: ${projectSummary01.name} and campaign: ${campaignSummary02.name} and email: ${leadEmail04}`,`and assing to sales name: ${leadReponse04.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse04.sales_details.id);

    // Validate for second combination of rule
    const leadEmail05 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail05 ,"Routing Lead",source02,subSource01,projectSummary02.id,"","",false,campaignSummary02.id);
    const leadReponse05 = await leadAPIUtils.leadRetrieve(leadEmail05);
    await utils.print(`Lead created with source: ${source02} and subSource: ${subSource01} and project: ${projectSummary02.name} and campaign: ${campaignSummary02.name} and email: ${leadEmail05}`,`and assing to sales name: ${leadReponse05.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse05.sales_details.id);

    // Validate for third combination of rule
    const leadEmail06 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail06 ,"Routing Lead",source03,subSource04,projectSummary03.id,"","",false,campaignSummary02.id);
    const leadReponse06 = await leadAPIUtils.leadRetrieve(leadEmail06);
    await utils.print(`Lead created with source: ${source03} and subSource: ${subSource04} and project: ${projectSummary03.name} and campaign: ${campaignSummary02.name} and email: ${leadEmail06}`,`and assing to sales name: ${leadReponse06.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse06.sales_details.id);

    // Validate for second combination of rule
    const leadEmail07 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail07 ,"Routing Lead",source04,subSource05,projectSummary04.id,"","",false,campaignSummary02.id);
    const leadReponse07 = await leadAPIUtils.leadRetrieve(leadEmail07);
    await utils.print(`Lead created with source: ${source04} and subSource: ${subSource05} and project: ${projectSummary04.name} and campaign: ${campaignSummary02.name} and email: ${leadEmail07}`,`and assing to sales name: ${leadReponse07.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse07.sales_details.id);

     // Validate for thired combination of rule
     const leadEmail10 = await utils.generateRandomEmail();
     await leadAPIUtils.createLeadWithDetails("",leadEmail10 ,"Routing Lead",source03,"",projectSummary03.id,"","",true,campaignSummary02.id);
     const leadReponse10 = await leadAPIUtils.leadRetrieve(leadEmail10);
     await utils.print(`Lead created with source: ${source03} and project: ${projectSummary03.name} and campaign: ${campaignSummary02.name} and email: ${leadEmail10}`,`and assing to sales name: ${leadReponse10.sales_details.name}` );
     expect(salesUserSummary3.id).toEqual(leadReponse10.sales_details.id);

    // Validate for fourth combination of rule
    const leadEmail08 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail08 ,"Routing Lead",source03,subSource03,projectSummary03.id,"","",false,campaignSummary02.id);
    const leadReponse08 = await leadAPIUtils.leadRetrieve(leadEmail08);
    await utils.print(`Lead created with source: ${source03} and subSource: ${subSource03} and project: ${projectSummary03.name} and campaign: ${campaignSummary02.name} and email: ${leadEmail08}`,`and assing to sales name: ${leadReponse08.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse08.sales_details.id);

    // Validate for fourth combination of rule
    const leadEmail09 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail09 ,"Routing Lead",source06,"",projectSummary06.id,"","",false,campaignSummary01.id);
    const leadReponse09 = await leadAPIUtils.leadRetrieve(leadEmail09);
    await utils.print(`Lead created with source: ${source06} and project: ${projectSummary06.name} and campaign: ${campaignSummary01.name} and email: ${leadEmail09}`,`and assing to sales name: ${leadReponse09.sales_details.name}` );
    expect(salesUserSummary4.id).toEqual(leadReponse09.sales_details.id);

     // Validate for fifth combination of rule
     const leadEmail11 = await utils.generateRandomEmail();
     await leadAPIUtils.createLeadWithDetails("",leadEmail11 ,"Routing Lead",source03,subSource03,projectSummary05.id,"","",false,campaignSummary02.id);
     const leadReponse11 = await leadAPIUtils.leadRetrieve(leadEmail11);
     await utils.print(`Lead created with source: ${source03} and subSource: ${subSource03} and project: ${projectSummary05.name} and campaign: ${campaignSummary02.name} and email: ${leadEmail11}`,`and assing to sales name: ${leadReponse11.sales_details.name}` );
     expect(salesUserSummary5.id).toEqual(leadReponse11.sales_details.id);

});

test('Validate lead routing for NRI', async () => {

    const utils = new Utils();
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
    const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

    const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
    const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
    const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
    const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});
    const salesUserSummary5 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:4});
    const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:5});

    const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
    const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});
    const projectSummary03 = await crmAPIUtils.getFirstActiveProjectSummary({index:2});
    const projectSummary04 = await crmAPIUtils.getFirstActiveProjectSummary({index:3});
    const projectSummary05 = await crmAPIUtils.getFirstActiveProjectSummary({index:4});
    const projectSummary06 = await crmAPIUtils.getFirstActiveProjectSummary({index:5});

    const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
    await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary4.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary5.id, true);
    await userManagementAPIUtils.saveCallAvailabilities(salesUserSummaryDefault.id, true);

    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary4.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary5.id,0,0,24,0);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);

    const source01 = (await crmAPIUtils.dataProvider_Source({ index: 1 })).id;
    const source02 = (await crmAPIUtils.dataProvider_Source({ index: 2 })).id;
    const source03 = (await crmAPIUtils.dataProvider_Source({ index: 3 })).id;
    const source04 = (await crmAPIUtils.dataProvider_Source({ index: 4 })).id;
    const source05 = (await crmAPIUtils.dataProvider_Source({ index: 5 })).id;
    const source06 = (await crmAPIUtils.dataProvider_Source({ index: 6 })).id;

    await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id","source","sub_source"]]');

    // Create Rule for NRI combination of rule
    await routingAPIUtils.createRoutingRule(
      "Rule 01 NRI",
      undefined,
      [projectSummary01.id, projectSummary02.id],
      [source01, source02],
      undefined,
      undefined,
      undefined,
      [salesUserSummary1.id],
      [salesUserSummary2.id],
      false,
      true,
      RoutingRuleStrategy.weighted_round_robin
    );

     // Create Rule for NRI combination of rule
     await routingAPIUtils.createRoutingRule(
        "Rule 02 NRI",
        undefined,
        [projectSummary03.id, projectSummary04.id],
        [source03, source04],
        undefined,
        undefined,
        undefined,
        [salesUserSummary3.id],
        [salesUserSummary4.id],
        false,
        true,
        RoutingRuleStrategy.weighted_round_robin
      );

    // Create Rule for Non NRI combination of rule
    await routingAPIUtils.createRoutingRule(
        "Rule 03 Non NRI",
        undefined,
        [projectSummary05.id, projectSummary06.id],
        [source05, source06],
        undefined,
        undefined,
        undefined,
        [salesUserSummary5.id],
        undefined,
        false,
        false,
        RoutingRuleStrategy.weighted_round_robin
      );

    // Validate for default combination of rule
    const leadEmail01 = await utils.generateRandomEmail();
    const leadEmail02 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead","","","","","",true);
    const leadReponse01 = await leadAPIUtils.leadRetrieve(leadEmail01);
    await utils.print(`lead routing for NRI: ${leadEmail01}`,`Sales name: ${leadReponse01.sales_details.name}` );
    expect(salesUserSummaryDefault.id).toEqual(leadReponse01.sales_details.id);

    // Validate for first combination of rule
    const leadEmail04 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead",source01,"",projectSummary02.id,"","",false);
    const leadReponse04 = await leadAPIUtils.leadRetrieve(leadEmail04);
    await utils.print(`lead routing for NRI: ${leadEmail04}`,`Sales name: ${leadReponse04.sales_details.name}` );
    expect(salesUserSummary1.id).toEqual(leadReponse04.sales_details.id);
    
    // Validate for first combination of rule
    const leadEmail05 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail05 ,"Routing Lead",source02,"",projectSummary01.id,"","",true);
    const leadReponse05 = await leadAPIUtils.leadRetrieve(leadEmail05);
    await utils.print(`lead routing for NRI: ${leadEmail05}`,`Sales name: ${leadReponse05.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse05.sales_details.id);

     // Validate for first combination of rule
     const leadEmail06 = await utils.generateRandomEmail();
     await leadAPIUtils.createLeadWithDetails("",leadEmail06 ,"Routing Lead",source05,"",projectSummary06.id,"","",false);
     const leadReponse06 = await leadAPIUtils.leadRetrieve(leadEmail06);
     await utils.print(`lead routing for NRI: ${leadEmail06}`,`Sales name: ${leadReponse06.sales_details.name}` );
     expect(salesUserSummary5.id).toEqual(leadReponse06.sales_details.id);

     // Validate for first combination of rule
     const leadEmail07 = await utils.generateRandomEmail();
     await leadAPIUtils.createLeadWithDetails("",leadEmail07 ,"Routing Lead",source05,"",projectSummary06.id,"","",true);
     const leadReponse07 = await leadAPIUtils.leadRetrieve(leadEmail07);
     await utils.print(`lead routing for NRI: ${leadEmail07}`,`Sales name: ${leadReponse07.sales_details.name}` );
     expect(salesUserSummary5.id).toEqual(leadReponse07.sales_details.id);

     // Validate for first combination of rule
     const leadEmail08 = await utils.generateRandomEmail();
     await leadAPIUtils.createLeadWithDetails("",leadEmail08 ,"Routing Lead",source03,"",projectSummary03.id,"","",true);
     const leadReponse08 = await leadAPIUtils.leadRetrieve(leadEmail08);
     await utils.print(`lead routing for NRI: ${leadEmail08}`,`Sales name: ${leadReponse08.sales_details.name}` );
     expect(salesUserSummary4.id).toEqual(leadReponse08.sales_details.id);

     // Validate for first combination of rule
     const leadEmail09 = await utils.generateRandomEmail();
     await leadAPIUtils.createLeadWithDetails("",leadEmail09 ,"Routing Lead",source03,"",projectSummary03.id,"","",false);
     const leadReponse09 = await leadAPIUtils.leadRetrieve(leadEmail09);
     await utils.print(`lead routing for NRI: ${leadEmail09}`,`Sales name: ${leadReponse09.sales_details.name}` );
     expect(salesUserSummary3.id).toEqual(leadReponse09.sales_details.id);

     // Validate for re-engagement NRI combination of rule
     await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead",source01,"",projectSummary02.id,"","",true);
     const leadReponse10 = await leadAPIUtils.leadRetrieve(leadEmail01);
     await utils.print(`lead routing for NRI: ${leadEmail01}`,`Sales name: ${leadReponse10.sales_details.name}` );
     expect(salesUserSummary2.id).toEqual(leadReponse10.sales_details.id);

     // Validate for re-engagement Non NRI combination of rule
     await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead",source02,"",projectSummary01.id,"","",false);
     const leadReponse11 = await leadAPIUtils.leadRetrieve(leadEmail02);
     await utils.print(`lead routing for NRI: ${leadEmail02}`,`Sales name: ${leadReponse11.sales_details.name}` );
     expect(salesUserSummary1.id).toEqual(leadReponse11.sales_details.id);

});

test('Validate lead routing for NRI and stikyess enabled for re-engagement', async () => {

  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
  const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
  const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
  const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

  const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
  const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
  const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
  const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});
  const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:5});

  const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
  const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});
  const projectSummary03 = await crmAPIUtils.getFirstActiveProjectSummary({index:2});
  const projectSummary04 = await crmAPIUtils.getFirstActiveProjectSummary({index:3});

  const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
  await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary4.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummaryDefault.id, true);

  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary4.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);

  const source01 = (await crmAPIUtils.dataProvider_Source({ index: 1 })).id;
  const source02 = (await crmAPIUtils.dataProvider_Source({ index: 2 })).id;
  const source03 = (await crmAPIUtils.dataProvider_Source({ index: 3 })).id;

  await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id","source","sub_source"]]');

  // Create Rule for NRI combination of rule
  await routingAPIUtils.createRoutingRule(
    "Rule 01 NRI",
    undefined,
    [projectSummary01.id, projectSummary02.id],
    [source01],
    undefined,
    undefined,
    undefined,
    [salesUserSummary1.id],
    [salesUserSummary2.id],
    false,
    true,
    RoutingRuleStrategy.weighted_round_robin
  );

   // Create Rule for NRI combination of rule
   await routingAPIUtils.createRoutingRule(
      "Rule 02 Stikyess enabled",
      undefined,
      [projectSummary03.id, projectSummary04.id],
      [source02, source03],
      undefined,
      undefined,
      undefined,
      [salesUserSummary3.id],
      [salesUserSummary4.id],
      true,
      true,
      RoutingRuleStrategy.weighted_round_robin
    );

  // Validate for default combination of rule
  const leadEmail01 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead twenty seven","","","","","",true);
  const leadReponse01 = await leadAPIUtils.leadRetrieve(leadEmail01);
  await utils.print(`lead routing for NRI and stikyess enabled for re-engagement: ${leadEmail01}`,`Sales name: ${leadReponse01.sales_details.name}` );
  expect(salesUserSummaryDefault.id).toEqual(leadReponse01.sales_details.id);
  
  const leadEmail02 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead twenty eight","","","","","",true);
  const leadReponse02 = await leadAPIUtils.leadRetrieve(leadEmail02);
  await utils.print(`lead routing for NRI and stikyess enabled for re-engagement: ${leadEmail02}`,`Sales name: ${leadReponse02.sales_details.name}` );
  expect(salesUserSummaryDefault.id).toEqual(leadReponse02.sales_details.id);

  // Validate for first combination of rule
  const leadEmail04 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead twenty nine",source01,"",projectSummary02.id,"","",false);
  const leadReponse04 = await leadAPIUtils.leadRetrieve(leadEmail04);
  await utils.print(`lead routing for NRI and stikyess enabled for re-engagement: ${leadEmail04}`,`Sales name: ${leadReponse04.sales_details.name}` );
  expect(salesUserSummary1.id).toEqual(leadReponse04.sales_details.id);
  
   // Validate for re-engagement combination of rule
   const leadEmail09 = await utils.generateRandomEmail();
   await leadAPIUtils.createLeadWithDetails("",leadEmail09 ,"Routing Lead thirty",source02,"",projectSummary03.id,"","",true);
   const leadReponse09 = await leadAPIUtils.leadRetrieve(leadEmail09);
   await utils.print(`lead routing for NRI and stikyess enabled for re-engagement: ${leadEmail09}`,`Sales name: ${leadReponse09.sales_details.name}` );
   expect(salesUserSummary4.id).toEqual(leadReponse09.sales_details.id);

   // Validate for re-engagement NRI combination of rule
   await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead thirty one",source02,"",projectSummary03.id,"","",true);
   const leadReponse10 = await leadAPIUtils.leadRetrieve(leadEmail04);
   await utils.print(`lead routing for NRI and stikyess enabled for re-engagement: ${leadEmail04}`,`Sales name: ${leadReponse10.sales_details.name}` );
   expect(salesUserSummary1.id).toEqual(leadReponse10.sales_details.id);

   // Validate for re-engagement Non NRI combination of rule
   await leadAPIUtils.createLeadWithDetails("",leadEmail09 ,"Routing Lead thirty two",source03,"",projectSummary04.id,"","",false);
   const leadReponse11 = await leadAPIUtils.leadRetrieve(leadEmail09);
   await utils.print(`lead routing for NRI and stikyess enabled for re-engagement: ${leadEmail09}`,`Sales name: ${leadReponse11.sales_details.name}` );
   expect(salesUserSummary4.id).toEqual(leadReponse11.sales_details.id);

   // Validate for re-engagement Non NRI combination of rule
   await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead thirty three",source01,"",projectSummary01.id,"","",true);
   const leadReponse12 = await leadAPIUtils.leadRetrieve(leadEmail02);
   await utils.print(`lead routing for NRI and stikyess enabled for re-engagement: ${leadEmail02}`,`Sales name: ${leadReponse12.sales_details.name}` );
   expect(salesUserSummary2.id).toEqual(leadReponse12.sales_details.id);

});

// test.only('Validate lead routing for calling medium values', async () => {

//   const utils = new Utils();
//   const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
//   const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
//   const callingAPIUtils = new CalligAPIUtils(clientId, fullAccessAPI);
//   const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
//   const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);

//   const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
//   const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
//   const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
//   const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});
//   const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});

//   const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
//   const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});
//   const projectSummary03 = await crmAPIUtils.getFirstActiveProjectSummary({index:2});
//   const projectSummary04 = await crmAPIUtils.getFirstActiveProjectSummary({index:3});
//   const projectSummary05 = await crmAPIUtils.getFirstActiveProjectSummary({index:4});
//   const projectSummary06 = await crmAPIUtils.getFirstActiveProjectSummary({index:5});
//   const projectSummary07 = await crmAPIUtils.getFirstActiveProjectSummary({index:6});
//   const projectSummary08 = await crmAPIUtils.getFirstActiveProjectSummary({index:7});
//   const projectSummary09 = await crmAPIUtils.getFirstActiveProjectSummary({index:8});

//   const campaignSummary03 = await crmAPIUtils.getFirstActiveCampaignSummary({index:2});

//   const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
//   await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

//   await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
//   await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
//   await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);
//   await userManagementAPIUtils.saveCallAvailabilities(salesUserSummaryDefault.id, true);

//   await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
//   await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
//   await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
//   await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);

//   await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["campaign_id","project_id","source","sub_source","medium_type","medium_value"]]');

//   // Create Rule for NRI combination of rule
//   await routingAPIUtils.createRoutingRule(
//     "Rule 01 Calling medium values",
//     [campaignSummary03.id],
//     [projectSummary07.id, projectSummary08.id],
//     [source09],
//     [subSource02],
//     MediumType.VirtualNumber,
//     [virtualNumber02],
//     [salesUserSummary1.id],
//     [salesUserSummary2.id],
//     false,
//     true,
//     RoutingRuleStrategy.weighted_round_robin
//   );

//    // Create Rule for NRI combination of rule
//    await routingAPIUtils.createRoutingRule(
//     "Rule 02 Calling medium values",
//     [campaignSummary03.id],
//     [projectSummary07.id, projectSummary08.id],
//     [source09],
//     [subSource02],
//     MediumType.VirtualNumber,
//     [virtualNumber02],
//     [salesUserSummary3.id],
//     [salesUserSummary4.id],
//     false,
//     true,
//     RoutingRuleStrategy.weighted_round_robin
//   );

//   //Validate for rule 01 combination of rule
//   const randomPhone = await utils.generateRandomPhoneNumber();
//   await callingAPIUtils.incomingCallDoocti(randomPhone, "",properties.New_Routing_Client_Doocti_VN_2);
//   const leadReponse01 = await leadAPIUtils.leadRetrieve(randomPhone);
//   expect(properties.New_Routing_Sales_Id_Rooted_1).toEqual(leadReponse01.sales_details.id);

//   //Validate for rule 02 combination of rule
//   const randomPhone2 = await utils.generateRandomPhoneNumber();
//   await callingAPIUtils.incomingCallDoocti(randomPhone2, "",properties.New_Routing_Client_Doocti_VN_1);
//   const leadReponse02 = await leadAPIUtils.leadRetrieve(randomPhone2);
//   expect(properties.New_Routing_Sales_Id_Rooted_3).toEqual(leadReponse02.sales_details.id);

//    //Validate for default combination of rule
//    const randomPhone3 = await utils.generateRandomPhoneNumber();
//    await callingAPIUtils.incomingCallDoocti(randomPhone3, "",properties.New_Routing_Client_Doocti_VN_3);
//    const leadReponse03 = await leadAPIUtils.leadRetrieve(randomPhone3);
//    expect(properties.New_Routing_Default_Sales_Id_1).toEqual(leadReponse03.sales_details.id);

// });

test('Validate routing priority', async () => {
  /**
   * Ensures routing **priority** (order of dimension tuples) decides which rule wins when
   * several rules could apply. Five rules are defined at increasing breadth:
   * medium+full fingerprint → sub_source → source → project → campaign-only.
   * After each `updateRoutingConfigurationWithArguments` priority change, the same lead shape
   * (campaign, projects, source, sub_source, ApiClient) should resolve to the expected sales user
   * for non-NRI vs NRI pools.
   */
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
  const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
  const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
  const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);

  const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales, { index: 0 });
  const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales, { index: 1 });
  const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales, { index: 2 });
  const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales, { index: 3 });
  const salesUserSummary5 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales, { index: 4 });
  const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales, { index: 5 });

  const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({ index: 0 });
  const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({ index: 1 });
  const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary({ index: 0 });

  const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
  await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

  const source01 = (await crmAPIUtils.dataProvider_Source({ index: 1 })).id;

  const subSource01 = (await crmAPIUtils.dataProvider_SubSource({ index: 1 })).id;

  for (const u of [
    salesUserSummary1,
    salesUserSummary2,
    salesUserSummary3,
    salesUserSummary4,
    salesUserSummary5,
    salesUserSummaryDefault,
  ]) {
    await userManagementAPIUtils.saveCallAvailabilities(u.id, true);
    await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(u.id, 0, 0, 24, 0);
  }

  await routingAPIUtils.updateRoutingConfigurationWithArguments(
    false,
    "weighted_round_robin",
    '[["campaign_id","project_id","source","sub_source","medium_type"],["campaign_id","project_id","source","sub_source"],["campaign_id","project_id","source"],["campaign_id","project_id"],["campaign_id"]]'
  );

  // Rule 01 — campaign + projects + source + sub_source + ApiClient (NRI pool on)
  await routingAPIUtils.createRoutingRule(
    "Rule 01 for campaign_id, project_id, source, sub_source, medium_type",
    [campaignSummary.id],
    [projectSummary01.id, projectSummary02.id],
    [source01],
    [subSource01],
    MediumType.ApiClient,
    undefined,
    [salesUserSummary1.id],
    [salesUserSummary2.id],
    false,
    true,
    RoutingRuleStrategy.weighted_round_robin
  );

  // Rule 02 — same dimensions without medium
  await routingAPIUtils.createRoutingRule(
    "Rule 02 for campaign_id, project_id, source, sub_source",
    [campaignSummary.id],
    [projectSummary01.id, projectSummary02.id],
    [source01],
    [subSource01],
    undefined,
    undefined,
    [salesUserSummary2.id],
    [salesUserSummary3.id],
    false,
    true,
    RoutingRuleStrategy.weighted_round_robin
  );

  // Rule 03 — campaign + projects + source
  await routingAPIUtils.createRoutingRule(
    "Rule 03 for campaign_id, project_id, source",
    [campaignSummary.id],
    [projectSummary01.id, projectSummary02.id],
    [source01],
    undefined,
    undefined,
    undefined,
    [salesUserSummary3.id],
    [salesUserSummary4.id],
    false,
    true,
    RoutingRuleStrategy.weighted_round_robin
  );

  // Rule 04 — campaign + projects only
  await routingAPIUtils.createRoutingRule(
    "Rule 04 for campaign_id, project_id",
    [campaignSummary.id],
    [projectSummary01.id, projectSummary02.id],
    undefined,
    undefined,
    undefined,
    undefined,
    [salesUserSummary4.id],
    [salesUserSummary5.id],
    false,
    true,
    RoutingRuleStrategy.weighted_round_robin
  );

  // Rule 05 — campaign only (no NRI split)
  await routingAPIUtils.createRoutingRule(
    "Rule 05 for campaign_id",
    [campaignSummary.id],
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    [salesUserSummary5.id],
    undefined,
    false,
    false,
    RoutingRuleStrategy.weighted_round_robin
  );

  const leadFingerprint = async (name: string, nri: boolean) => {
    const email = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails(
      "",
      email,
      name,
      source01,
      subSource01,
      projectSummary01.id,
      "",
      "",
      nri,
      campaignSummary.id
    );
    const leadMetaData = await leadAPIUtils.leadRetrieve(email);
    await utils.print(`Lead email : ${email} and sales name is ${leadMetaData.sales_details.name}`);
    return leadMetaData;
  };

  // Priority: medium tuple first → non-NRI hits Rule 01 primary pool; NRI hits Rule 01 NRI pool
  const leadReponse01 = await leadFingerprint("Routing Lead thirty five", false);
  expect(salesUserSummary1.id).toEqual(leadReponse01.sales_details.id);

  const leadReponse01_nri = await leadFingerprint("Routing Lead thirty six", true);
  expect(salesUserSummary2.id).toEqual(leadReponse01_nri.sales_details.id);

  await routingAPIUtils.updateRoutingConfigurationWithArguments(
    false,
    "weighted_round_robin",
    '[["campaign_id","project_id","source","sub_source"],["campaign_id","project_id","source"],["campaign_id","project_id"],["campaign_id"],["campaign_id","project_id","source","sub_source","medium_type"]]'
  );

  const leadReponse02 = await leadFingerprint("Routing Lead thirty seven", false);
  expect(salesUserSummary2.id).toEqual(leadReponse02.sales_details.id);

  const leadReponse02_nri = await leadFingerprint("Routing Lead thirty seven NRI", true);
  expect(salesUserSummary3.id).toEqual(leadReponse02_nri.sales_details.id);

  await routingAPIUtils.updateRoutingConfigurationWithArguments(
    false,
    "weighted_round_robin",
    '[["campaign_id","project_id","source"],["campaign_id","project_id"],["campaign_id"],["campaign_id","project_id","source","sub_source","medium_type"],["campaign_id","project_id","source","sub_source"]]'
  );

  const leadReponse03 = await leadFingerprint("Routing Lead thirty eight", false);
  expect(salesUserSummary3.id).toEqual(leadReponse03.sales_details.id);

  const leadReponse03_nri = await leadFingerprint("Routing Lead thirty nine", true);
  expect(salesUserSummary4.id).toEqual(leadReponse03_nri.sales_details.id);

  await routingAPIUtils.updateRoutingConfigurationWithArguments(
    false,
    "weighted_round_robin",
    '[["campaign_id","project_id"],["campaign_id"],["campaign_id","project_id","source","sub_source","medium_type"],["campaign_id","project_id","source","sub_source"],["campaign_id","project_id","source"]]'
  );

  const leadReponse04 = await leadFingerprint("Routing Lead forty", false);
  expect(salesUserSummary4.id).toEqual(leadReponse04.sales_details.id);

  const leadReponse04_nri = await leadFingerprint("Routing Lead forty one", true);
  expect(salesUserSummary5.id).toEqual(leadReponse04_nri.sales_details.id);

  await routingAPIUtils.updateRoutingConfigurationWithArguments(
    false,
    "weighted_round_robin",
    '[["campaign_id"],["campaign_id","project_id","source","sub_source","medium_type"],["campaign_id","project_id","source","sub_source"],["campaign_id","project_id","source"],["campaign_id","project_id"]]'
  );

  const leadReponse05 = await leadFingerprint("Routing Lead forty two", false);
  expect(salesUserSummary5.id).toEqual(leadReponse05.sales_details.id);

  const leadReponse05_nri = await leadFingerprint("Routing Lead forty two NRI", true);
  expect(salesUserSummary5.id).toEqual(leadReponse05_nri.sales_details.id);
});

test('Validate lead routing for project combination of rules', async () => {

  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
  const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
  const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);

  const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
  const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
  const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
  const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
  const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});
  const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:9});

  const defaultRuleId = await routingAPIUtils.deleteNonDefaultRules();
  await routingAPIUtils.updateRoutingRuleById(defaultRuleId, salesUserSummaryDefault.id);

  const projectSummary01 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
  const projectSummary02 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});
  const projectSummary03 = await crmAPIUtils.getFirstActiveProjectSummary({index:2});
  const projectSummary04 = await crmAPIUtils.getFirstActiveProjectSummary({index:3});
  const projectSummary05 = await crmAPIUtils.getFirstActiveProjectSummary({index:4});
  const projectSummary06 = await crmAPIUtils.getFirstActiveProjectSummary({index:5});
  const projectSummary07 = await crmAPIUtils.getFirstActiveProjectSummary({index:6});
  const projectSummary08 = await crmAPIUtils.getFirstActiveProjectSummary({index:7});
  const projectSummary09 = await crmAPIUtils.getFirstActiveProjectSummary({index:8});
  const projectSummary10 = await crmAPIUtils.getFirstActiveProjectSummary({index:9});

  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary4.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummaryDefault.id, true);

  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary4.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);


  await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["project_id"]]');

  // Create Rule for NRI combination of rule
    await routingAPIUtils.createRoutingRule(
      "Rule 01 for project 1 2 3",
      undefined,
      [projectSummary01.id, projectSummary02.id, projectSummary03.id],
      undefined,
      undefined,
      undefined,
      undefined,
      [salesUserSummary1.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

    // Create Rule for NRI combination of rule
    await routingAPIUtils.createRoutingRule(
      "Rule 02 for project 2 3 4",
      undefined,
      [projectSummary02.id, projectSummary03.id, projectSummary04.id],
      undefined,
      undefined,
      undefined,
      undefined,
      [salesUserSummary2.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
    );

   // Create Rule for campaign_id, project_id, source
   await routingAPIUtils.createRoutingRule(
      "Rule 03 for project 4 5 6",
      undefined,
      [projectSummary04.id, projectSummary05.id, projectSummary06.id],
      undefined,
      undefined,
      undefined,
      undefined,
      [salesUserSummary3.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
  );

    // Create Rule for campaign_id, project_id, source
    await routingAPIUtils.createRoutingRule(
      "Rule 04 for project 6 7 8",
      undefined,
      [projectSummary06.id, projectSummary07.id, projectSummary09.id],
      undefined,
      undefined,
      undefined,
      undefined,
      [salesUserSummary4.id],
      undefined,
      false,
      false,
      RoutingRuleStrategy.weighted_round_robin
  );

  // Leads for first Rule
  const projectId01 = [projectSummary01.id, projectSummary02.id, projectSummary03.id];
  const leadEmail01 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead fourty three","","",projectId01,"","");
  const leadReponse01 = await leadAPIUtils.leadRetrieve(leadEmail01);
  await utils.print(`leadEmail01 lead routing for project combination of rules: ${leadEmail01}`,`Sales name: ${leadReponse01.sales_details.name}` );
  expect(salesUserSummary1.id).toEqual(leadReponse01.sales_details.id);

  const projectId02 = [projectSummary02.id, projectSummary03.id, projectSummary04.id];
  const leadEmail02 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead fourty four","","",projectId02,"","");
  const leadReponse02 = await leadAPIUtils.leadRetrieve(leadEmail02);
  await utils.print(`leadEmail02 lead routing for project combination of rules: ${leadEmail02}`,`Sales name: ${leadReponse02.sales_details.name}` );
  expect(salesUserSummary1.id).toEqual(leadReponse02.sales_details.id);

  const projectId03 = [projectSummary03.id, projectSummary04.id, projectSummary05.id];
  const leadEmail03 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail03 ,"Routing Lead fourty five","","",projectId03,"","");
  const leadReponse03 = await leadAPIUtils.leadRetrieve(leadEmail03);
  await utils.print(`leadEmail03 lead routing for project combination of rules: ${leadEmail03}`,`Sales name: ${leadReponse03.sales_details.name}` );
  expect(salesUserSummary1.id).toEqual(leadReponse03.sales_details.id);

  // Leads for second Rule
  const projectId04 = [projectSummary04.id, projectSummary05.id, projectSummary06.id];
  const leadEmail04 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead fourty six","","",projectId04,"","");
  const leadReponse04 = await leadAPIUtils.leadRetrieve(leadEmail04);
  await utils.print(`leadEmail04 lead routing for project combination of rules: ${leadEmail04}`,`Sales name: ${leadReponse04.sales_details.name}` );
  expect(salesUserSummary2.id).toEqual(leadReponse04.sales_details.id);

  const projectId05 = [projectSummary05.id, projectSummary04.id, projectSummary07.id];
  const leadEmail05 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail05 ,"Routing Lead fourty seven","","",projectId05,"","");
  const leadReponse05 = await leadAPIUtils.leadRetrieve(leadEmail05);
  await utils.print(`leadEmail05 lead routing for project combination of rules: ${leadEmail05}`,`Sales name: ${leadReponse05.sales_details.name}` );
  expect(salesUserSummary3.id).toEqual(leadReponse05.sales_details.id);

  const projectId06 = [projectSummary03.id, projectSummary04.id, projectSummary05.id];
  const leadEmail06 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail06 ,"Routing Lead fourty eight","","",projectId06,"","");
  const leadReponse06 = await leadAPIUtils.leadRetrieve(leadEmail06);
  await utils.print(`leadEmail06 lead routing for project combination of rules: ${leadEmail06}`,`Sales name: ${leadReponse06.sales_details.name}` );
  expect(salesUserSummary1.id).toEqual(leadReponse06.sales_details.id);

  // Leads for third Rule
  const projectId07 = [projectSummary06.id, projectSummary08.id, projectSummary09.id];
  const leadEmail07 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail07 ,"Routing Lead fourty nine","","",projectId07,"","");
  const leadReponse07 = await leadAPIUtils.leadRetrieve(leadEmail07);
  await utils.print(`leadEmail07 lead routing for project combination of rules: ${leadEmail07}`,`Sales name: ${leadReponse07.sales_details.name}` );
  expect(salesUserSummary3.id).toEqual(leadReponse07.sales_details.id);

  const projectId08 = [projectSummary05.id, projectSummary06.id];
  const leadEmail08 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail08 ,"Routing Lead fifty","","",projectId08,"","");
  const leadReponse08 = await leadAPIUtils.leadRetrieve(leadEmail08);
  await utils.print(`leadEmail08 lead routing for project combination of rules: ${leadEmail08}`,`Sales name: ${leadReponse08.sales_details.name}` );
  expect(salesUserSummary3.id).toEqual(leadReponse08.sales_details.id);

  // Leads for Default Rule
  const projectId09 = [projectSummary10.id, projectSummary08.id];
  const leadEmail09 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail09 ,"Routing Lead fifty one","","",projectId09,"","");
  const leadReponse09 = await leadAPIUtils.leadRetrieve(leadEmail09);
  await utils.print(`leadEmail09 lead routing for project combination of rules: ${leadEmail09}`,`Sales name: ${leadReponse09.sales_details.name}` );
  expect(salesUserSummaryDefault.id).toEqual(leadReponse09.sales_details.id);

  // Combination of rules
  const projectId10 = [projectSummary03.id, projectSummary01.id, projectSummary02.id];
  const leadEmail10 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail10 ,"Routing Lead fifty two","","",projectId10,"","");
  const leadReponse10 = await leadAPIUtils.leadRetrieve(leadEmail10);
  await utils.print(`leadEmail10 lead routing for project combination of rules: ${leadEmail10}`,`Sales name: ${leadReponse10.sales_details.name}` );
  expect(salesUserSummary1.id).toEqual(leadReponse10.sales_details.id);

  const projectId11 = [projectSummary03.id, projectSummary01.id, projectSummary02.id];
  const leadEmail11 = await utils.generateRandomEmail();
  await leadAPIUtils.createLeadWithDetails("",leadEmail11 ,"Routing Lead fifty three","","",projectId11,"","");
  const leadReponse11 = await leadAPIUtils.leadRetrieve(leadEmail11);
  await utils.print(`leadEmail11 lead routing for project combination of rules: ${leadEmail11}`,`Sales name: ${leadReponse11.sales_details.name}` );
  expect(salesUserSummary1.id).toEqual(leadReponse11.sales_details.id);
});

test('Validate call availablity and lead assignment', async () => {

  const utils = new Utils();
  const userManagementAPIUtils = new UserManagementAPIUtils(clientId, fullAccessAPI);
  const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
  const salesUserSummary1 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:0});
  const salesUserSummary2 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:1});
  const salesUserSummary3 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:2});
  const salesUserSummary4 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:3});
  const salesUserSummary5 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:4});
  const salesUserSummary6 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:5});
  const salesUserSummary7 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:6});
  const salesUserSummary8 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:7});
  const salesUserSummary9 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:8});
  const salesUserSummary10 = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:9});
  const salesUserSummaryDefault = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales,{index:10});

  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary1.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary2.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary3.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary4.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary5.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary6.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary7.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary8.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary9.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummary10.id, true);
  await userManagementAPIUtils.saveCallAvailabilities(salesUserSummaryDefault.id, true);

  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary1.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary2.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary3.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary4.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary5.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary6.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary7.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary8.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary9.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummary10.id,0,0,24,0);
  await userManagementAPIUtils.updateUserCallAvailabilityForFullWeek(salesUserSummaryDefault.id,0,0,24,0);

  const projectSummary10 = await crmAPIUtils.getFirstActiveProjectSummary({index:0});
  const projectSummary09 = await crmAPIUtils.getFirstActiveProjectSummary({index:1});

  await userManagementAPIUtils.updateUserCallAvailability(salesUserSummary4.id, false, [salesUserSummary1.id], [salesUserSummary4.id]);
  await userManagementAPIUtils.updateUserCallAvailability(salesUserSummary1.id, false, [salesUserSummary2.id], [salesUserSummary3.id]);

  await userManagementAPIUtils.updateUserCallAvailability(salesUserSummary7.id, false, [salesUserSummary5.id], [salesUserSummary8.id]);
  await userManagementAPIUtils.updateUserCallAvailability(salesUserSummary5.id, false, [salesUserSummary9.id], [salesUserSummary6.id]);

  const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
  const routingAPIUtils = new RoutingAPIUtils(clientId, fullAccessAPI);
  await routingAPIUtils.updateRoutingConfigurationWithArguments(false, "weighted_round_robin", '[["project_id"]]');

  // Create Rule for NRI combination of rule
  await routingAPIUtils.createRoutingRule(
    "Rule 01",
    undefined,
    [projectSummary10.id],
    undefined,
    undefined,
    undefined,
    undefined,
    [salesUserSummary1.id],
    [salesUserSummary5.id],
    false,
    true,
    RoutingRuleStrategy.weighted_round_robin
  );

   // Create Rule for NRI combination of rule
   await routingAPIUtils.createRoutingRule(
    "Rule 02",
    undefined,
    [projectSummary09.id],
    undefined,
    undefined,
    undefined,
    undefined,
    [salesUserSummary4.id],
    [salesUserSummary7.id],
    false,
    true,
    RoutingRuleStrategy.weighted_round_robin
  );

    // Logic for non NRI combination of rule
    const projectId01 = [projectSummary10.id];
    const leadEmail01 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail01 ,"Routing Lead fifty five","","",projectId01,"","");
    const leadReponse01 = await leadAPIUtils.leadRetrieve(leadEmail01);
    await utils.print(`leadEmail01 lead routing for call availablity and lead assignment: ${leadEmail01}`,`Sales name: ${leadReponse01.sales_details.name}` );
    expect(salesUserSummary2.id).toEqual(leadReponse01.sales_details.id);

    const projectId02 = [projectSummary09.id];
    const leadEmail02 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail02 ,"Routing Lead fifty six","","",projectId02,"","");
    const leadReponse02 = await leadAPIUtils.leadRetrieve(leadEmail02);
    await utils.print(`leadEmail02 lead routing for call availablity and lead assignment: ${leadEmail02}`,`Sales name: ${leadReponse02.sales_details.name}` );
    expect(salesUserSummary3.id).toEqual(leadReponse02.sales_details.id);

    // Logic for NRI combination of rule
    const projectId03 = [projectSummary10.id];
    const leadEmail03 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail03 ,"Routing Lead fifty seven","","",projectId03,"","",true);
    const leadReponse03 = await leadAPIUtils.leadRetrieve(leadEmail03);
    await utils.print(`leadEmail03 lead routing for call availablity and lead assignment: ${leadEmail03}`,`Sales name: ${leadReponse03.sales_details.name}` );
    expect(salesUserSummary9.id).toEqual(leadReponse03.sales_details.id);

    const projectId04 = [projectSummary09.id];
    const leadEmail04 = await utils.generateRandomEmail();
    await leadAPIUtils.createLeadWithDetails("",leadEmail04 ,"Routing Lead fifty eight","","",projectId04,"","",true);
    const leadReponse04 = await leadAPIUtils.leadRetrieve(leadEmail04);
    await utils.print(`leadEmail04 lead routing for call availablity and lead assignment: ${leadEmail04}`,`Sales name: ${leadReponse04.sales_details.name}` );
    expect(salesUserSummary6.id).toEqual(leadReponse04.sales_details.id);
});
