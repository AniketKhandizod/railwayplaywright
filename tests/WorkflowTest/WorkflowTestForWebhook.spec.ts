import { test, expect } from "@playwright/test";
import { ActivityType, LeadAPIUtils, SiteVisitAction } from "../../utils/APIUtils/LeadAPIUtils.ts";
import { WorkFlowAPIUtils } from "../../utils/APIUtils/WorkFlowAPIUtils.ts";
import { properties } from "../../properties/v2.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AutomationPage } from "../../pages/AdminAndSupportPages/AutomationPage.ts";
import { WorkFlowListPage,WorkFlowEvents,WorkFlowConditions } from "../../pages/AdminAndSupportPages/WorkFlowPages/WorkFlowListPage.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { CreateWorkFlowPage, WorkFlowActions, WorkFlowOperators } from "../../pages/AdminAndSupportPages/WorkFlowPages/CreateWorkFlowPage.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { WebhookHistoryPage } from "../../pages/AdminAndSupportPages/WorkFlowPages/WebhookHistoryPage.ts";
const loopIterations = 1000;
const buffer = 20;
test.describe.configure({ mode: "parallel"});

// On Aniket automation client
test("Validate workflow webhook trigger", async ({ page }) => {

  const utils = new Utils();
  const passStages = ["prospect", "incoming"];
  const failStage = "unqualified";
  const passString = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const failString = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const workflowName = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});

  const sidePanal = new SidePanal(page);
  const automationPage = new AutomationPage(page);
  const workflowListPage = new WorkFlowListPage(page);
  const createWorkFlowPage = new CreateWorkFlowPage(page);
  const loginPage = new LoginPage(page);
  const webhookHistoryPage = new WebhookHistoryPage(page);
  
  //deactivate all active workflows
  const workflowAPIUtils = new WorkFlowAPIUtils(properties.WF_Client_Id_05, properties.WF_Client_FullAccess_API_05);
  await workflowAPIUtils.deactivateAllActiveWorkflows();
  
  await loginPage.loginWithClientId(properties.SM_05, properties.PASSWORD, properties.WF_Client_Id_05);

  const webhookUrl = new URL(page.url()).origin+"/api/leads/create.json";
  const generateRandomEmail = await utils.generateRandomEmail();
  
  const webhookPayload = await utils.getLeadCreatePayload(generateRandomEmail,"",properties.WF_Client_RestrictedAccess_API_05);

  // Navigate to Automation Page
  await sidePanal.clickOnAutomation();
  await automationPage.clickOnWorkflows();
  await workflowListPage.clickOnNewWorkflowButton();

  // Create Workflow
  await workflowListPage.enterWFName(workflowName);
  await workflowListPage.enterWFDescription(await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false}));
  await workflowListPage.clickOnGetStarted();
  await workflowListPage.getAllChooseButtonAndClick(WorkFlowEvents.Stage_Changed);

  // Desgine workflow operators
  await createWorkFlowPage.clickOnAddAction();
  await createWorkFlowPage.clickOnAddActionAfterSelectingAction();
  await createWorkFlowPage.selectAction(WorkFlowActions.Webhook);
  await createWorkFlowPage.configureWebhook(webhookUrl);
  await createWorkFlowPage.clickOnCustomPayloadCheckbox();
  await createWorkFlowPage.enterCustomPayload(webhookPayload);

  await createWorkFlowPage.clickOnWFSave();
  await createWorkFlowPage.backToAllWorkflows();

  // Activate workflow
  await workflowListPage.clickOnFilterIcon();
  await workflowListPage.clearStatusOnly();
  await workflowListPage.SearchWorkFlow(workflowName);
  await workflowListPage.clickOnApplyFilterButton();
  await workflowListPage.Activate_Action_WorkFlow();
  await workflowListPage.displayAllActiveWF();

  const leadAPI = new LeadAPIUtils(properties.WF_Client_Id_05, properties.WF_Client_FullAccess_API_05, properties.WF_Client_RestrictedAccess_API_05);
  const lead = await leadAPI.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"","","","","","");
  await leadAPI.stageChange(lead.sell_do_lead_id, passStages[0], "");

  const leadRetrieve = await leadAPI.leadRetrieve(generateRandomEmail) as any;
  expect(leadRetrieve?.exists).toBe(true);

  await sidePanal.clickOnAutomation();
  await automationPage.clickOnWorkflowWebhookHistory();

  const webhookHistoryDate = await webhookHistoryPage.getWebhookHistoryDate();
  const webhookHistoryURL = await webhookHistoryPage.getWebhookHistoryURL();
  const webhookHistoryPayload = await webhookHistoryPage.getWebhookHistoryPayload();
  const webhookHistoryEvent = await webhookHistoryPage.getWebhookHistoryEvent();
  const webhookHistoryStatus = await webhookHistoryPage.getWebhookHistoryStatus();
  
  expect(webhookHistoryDate).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"dd MMM yyyy"));
  expect(webhookHistoryURL).toBe(webhookUrl);
  expect(webhookHistoryEvent).toBe("stage_changed");
  expect(webhookHistoryStatus).toBe("active");
  
  // Convert Ruby hash format to JSON format for comparison
  const normalizedHistoryPayload = webhookHistoryPayload
    .replace(/=>/g, ':')
    .replace(/\s/g, '');
  const normalizedWebhookPayload = webhookPayload.replace(/\s/g, '');
  expect(normalizedHistoryPayload).toContain(normalizedWebhookPayload);

  test.info().annotations.push({
    type: `Workflow Test with webhook trigger on aniket automation client`,
    description: lead.sell_do_lead_id || 'Lead ID not found'
   });
  
});

test.fixme("Validate workflow webhook trigger on site visit conducted", async ({ page }) => {

  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.WF_Client_Id_06, properties.WF_Client_FullAccess_API_06, properties.WF_Client_RestrictedAccess_API_06);

   // Create a lead
   const customerPhone = await utils.generateRandomPhoneNumber();
   const lead = await leadAPIUtils.createLeadWithDetails(
     customerPhone,
     await utils.generateRandomEmail(),
     "Nine Workflow Lead",
     "",
     "",
     "",
     properties.WF_Clinet_Sales_Id_06,
     ""
   );

    // 1) create site visit conducted
    const startDate_01 =
    (await utils.calculateFutureDate(AheadOf.Minute, 15, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_01 =
    (await utils.calculateFutureDate(AheadOf.Minute, 45, "yyyy-MM-dd HH:mm")) +
    " IST";
    console.log(startDate_01, endDate_01);
    console.log(lead.sell_do_lead_id);
  const siteVisit_01 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_01,
    endDate_01,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_01,
    false
  );

   // update site visit status to conducted
   await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_01.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Conducted
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(1);
});