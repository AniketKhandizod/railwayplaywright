import { test, expect } from "@playwright/test";
import { ActivityType, LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils.ts";
import { WorkFlowAPIUtils } from "../../utils/APIUtils/WorkFlowAPIUtils.ts";
import { properties } from "../../properties/v2.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AutomationPage } from "../../pages/AdminAndSupportPages/AutomationPage.ts";
import { WorkFlowListPage,WorkFlowEvents,WorkFlowConditions } from "../../pages/AdminAndSupportPages/WorkFlowPages/WorkFlowListPage.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { CreateWorkFlowPage, WorkFlowActions, WorkFlowOperators } from "../../pages/AdminAndSupportPages/WorkFlowPages/CreateWorkFlowPage.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";

test.describe.configure({ mode: "parallel"});
// On mini mind client
test.setTimeout(15 * 60 * 1000);
test("Validate Workflow Design with delay", async ({ page }) => {

  const utils = new Utils();
  const sidePanal = new SidePanal(page);
  const automationPage = new AutomationPage(page);
  const workflowListPage = new WorkFlowListPage(page);
  const createWorkFlowPage = new CreateWorkFlowPage(page);
  const loginPage = new LoginPage(page);
  const workflowAPIUtils = new WorkFlowAPIUtils(properties.WF_Client_Id_01, properties.WF_Client_FullAccess_API_01);
  const delay = 1;

  const passStages = ["prospect", "incoming"];
  const failStage = "unqualified";
  const passString = await utils.generateRandomString(100, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const failString = await utils.generateRandomString(100, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const workflowName = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const workflowDescription = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  
  //deactivate all active workflows
  await workflowAPIUtils.deactivateAllActiveWorkflows();
  
  await loginPage.loginWithClientId(properties.SM_01, properties.PASSWORD, properties.WF_Client_Id_01);

  // Navigate to Automation Page
  await sidePanal.clickOnAutomation();
  await automationPage.clickOnWorkflows();
  await workflowListPage.clickOnNewWorkflowButton();

  // Create Workflow
  await workflowListPage.enterWFName(workflowName);
  await workflowListPage.enterWFDescription(workflowDescription);
  await workflowListPage.clickOnGetStarted();
  await workflowListPage.getAllChooseButtonAndClick(WorkFlowEvents.Stage_Changed);

  // Desgine workflow operators
  await createWorkFlowPage.clickOnAddCondition();
  await createWorkFlowPage.clickOnMatchAny();
  await createWorkFlowPage.selectCondition(WorkFlowConditions.Sales_Pipeline_Stage);
  await createWorkFlowPage.selectOnOperator(WorkFlowOperators.Equals);
  await createWorkFlowPage.selectValue(passStages[0]);
  await createWorkFlowPage.clickOnAddConditionBelowOperators();
  await createWorkFlowPage.selectCondition_2(WorkFlowConditions.Presales_Pipeline_Stage);
  await createWorkFlowPage.selectOnOperator_2(WorkFlowOperators.Equals);
  await createWorkFlowPage.selectValue_2(passStages[1]);
  await createWorkFlowPage.clickOnWFSave();

  // Desgine workflow pass actions
  await createWorkFlowPage.clickOnIfConditionSucceeds();
  await createWorkFlowPage.clickOnAddAction();
  await createWorkFlowPage.clickOnAddActionAfterSelectingAction();
  await createWorkFlowPage.selectAction(WorkFlowActions.Add_Note);
  await createWorkFlowPage.addDelay(`${delay}`);
  await createWorkFlowPage.noteAction(passString);
  await createWorkFlowPage.clickOnWFSave();

  // Desgine workflow fail actions
  await createWorkFlowPage.clickOnIfConditionFails();
  await createWorkFlowPage.clickOnAddAction();
  await createWorkFlowPage.clickOnAddActionAfterSelectingAction();
  await createWorkFlowPage.selectAction(WorkFlowActions.Add_Note);
  await createWorkFlowPage.addDelay(`${delay}`);
  await createWorkFlowPage.noteAction(failString);
  await createWorkFlowPage.clickOnWFSave();
  await createWorkFlowPage.backToAllWorkflows();

  // Activate workflow
  await workflowListPage.clickOnFilterIcon();
  await workflowListPage.clearStatusOnly();
  await workflowListPage.SearchWorkFlow(workflowName);
  await workflowListPage.clickOnApplyFilterButton();
  await workflowListPage.Activate_Action_WorkFlow();
  await workflowListPage.displayAllActiveWF();

  const leadAPIUtils = new LeadAPIUtils(properties.WF_Client_Id_01, properties.WF_Client_FullAccess_API_01, properties.WF_Client_RestrictedAccess_API_01);
  let lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"","","","","","");
  
  expect(await workflowListPage.getWorkflowTitle()).toBe(workflowName);
  expect(await workflowListPage.getWorkflowDescription()).toBe(workflowDescription);
  expect(await workflowListPage.getWorkflowTriggerEvent()).toBe("Stage Changed");

  // Pass testing
  await leadAPIUtils.stageChange(lead.sell_do_lead_id, passStages[0], "");

  await utils.sleep((delay+3) * 60 * 1000);
  
  let leadDetails = await leadAPIUtils.getLeadDetails(lead.sell_do_lead_id);
  let leadFeed = await leadAPIUtils.getLeadActivity(lead.sell_do_lead_id, ActivityType.Note);
  let timeDifference = await utils.getTimeDifferenceInSeconds(leadDetails.created_at, leadFeed.results[0].note.created_at);
  
  expect(timeDifference).toBeGreaterThanOrEqual((delay + 1) * 60);
  expect(timeDifference).toBeLessThanOrEqual((delay + 2) * 60);

  const leadPass = lead.sell_do_lead_id;
 
  // Fail testing
  lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"","","","","","");
  await leadAPIUtils.stageChange(lead.sell_do_lead_id, failStage, "");
  
  await utils.sleep((delay+3) * 60 * 1000);

  leadDetails = await leadAPIUtils.getLeadDetails(lead.sell_do_lead_id);
  leadFeed = await leadAPIUtils.getLeadActivity(lead.sell_do_lead_id, ActivityType.Note);
  timeDifference = await utils.getTimeDifferenceInSeconds(leadDetails.created_at, leadFeed.results[0].note.created_at);

  expect(timeDifference).toBeGreaterThanOrEqual((delay + 1) * 60);
  expect(timeDifference).toBeLessThanOrEqual((delay + 2) * 60);
  
  leadFeed = await leadAPIUtils.getLeadActivity(lead.sell_do_lead_id, ActivityType.Note);
  expect(1).toBe(leadFeed.results.length);
  leadFeed = await leadAPIUtils.getLeadActivity(leadPass, ActivityType.Note);
  expect(1).toBe(leadFeed.results.length);

  test.info().annotations.push({
    type: `Workflow Test with delay for ${delay} minutes on mini mind client`,
    description: `For pass ${leadPass} for fail ${lead.sell_do_lead_id}` || 'Lead ID not found'
    });
});
