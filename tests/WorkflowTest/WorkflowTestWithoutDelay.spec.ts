import { test, expect } from "@playwright/test";
import { ActivityType, LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils.ts";
import { WorkFlowAPIUtils } from "../../utils/APIUtils/WorkFlowAPIUtils.ts";
import { properties } from "../../properties/v2.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AutomationPage } from "../../pages/AdminAndSupportPages/AutomationPage.ts";
import { WorkFlowListPage,WorkFlowEvents,WorkFlowConditions } from "../../pages/AdminAndSupportPages/WorkFlowPages/WorkFlowListPage.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { CreateWorkFlowPage, WorkFlowActions, WorkFlowOperators } from "../../pages/AdminAndSupportPages/WorkFlowPages/CreateWorkFlowPage.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
const loopIterations = 1000;
test.describe.configure({ mode: "parallel"});

// On Dummy Routing client
test.setTimeout(25 * 60 * 1000);
test("Validate Workflow Design without delay", async ({ page }) => {

  const utils = new Utils();
  const passStages = ["prospect", "incoming"];
  const failStage = "unqualified";
  const passString = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const failString = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const workflowName = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const workflowDescription = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const waitTime = 200;
  const loopValidation = 300;

  const sidePanal = new SidePanal(page);
  const automationPage = new AutomationPage(page);
  const workflowListPage = new WorkFlowListPage(page);
  const createWorkFlowPage = new CreateWorkFlowPage(page);
  const loginPage = new LoginPage(page);
  
  //deactivate all active workflows
  const workflowAPIUtils = new WorkFlowAPIUtils(properties.WF_Client_Id_02, properties.WF_Client_FullAccess_API_02);
  await workflowAPIUtils.deactivateAllActiveWorkflows();

  await loginPage.loginWithClientId(properties.SM_02, properties.PASSWORD, properties.WF_Client_Id_02);

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
  await createWorkFlowPage.noteAction(passString);
  await createWorkFlowPage.clickOnWFSave();

  // Desgine workflow fail actions
  await createWorkFlowPage.clickOnIfConditionFails();
  await createWorkFlowPage.clickOnAddAction();
  await createWorkFlowPage.clickOnAddActionAfterSelectingAction();
  await createWorkFlowPage.selectAction(WorkFlowActions.Add_Note);
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

  const leadAPI = new LeadAPIUtils(properties.WF_Client_Id_02, properties.WF_Client_FullAccess_API_02, properties.WF_Client_RestrictedAccess_API_02);
  const lead = await leadAPI.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"","","","","","");
  const leadPass = lead.sell_do_lead_id;

  expect(await workflowListPage.getWorkflowTitle()).toBe(workflowName);
  expect(await workflowListPage.getWorkflowDescription()).toBe(workflowDescription);
  expect(await workflowListPage.getWorkflowTriggerEvent()).toBe("Stage Changed");

  // Stage Change 1
  await leadAPI.stageChange(lead.sell_do_lead_id, passStages[0], "");

  for(let i = 0; i < loopIterations; i++){
    await utils.sleep(waitTime);
    const activity = await leadAPI.getLeadActivity(lead.sell_do_lead_id, ActivityType.Note);
    const count = activity.results.filter((r: any) => r.note?.content === passString).length;
    expect(i).toBeLessThan(loopValidation);
    if(count == 1){
        break;
      }
  }

  // Stage Change 2
  await leadAPI.stageChange(lead.sell_do_lead_id, passStages[1], "");
  await utils.sleep(waitTime);

  for(let i = 0; i < loopIterations; i++){
    const activity = await leadAPI.getLeadActivity(lead.sell_do_lead_id, ActivityType.Note);
    const count = activity.results.filter((r: any) => r.note?.content === passString).length;
    expect(i).toBeLessThan(loopValidation);
      if(count == 2){
        break;
      }
  }

  // Fail Validation - 1
  await leadAPI.stageChange(lead.sell_do_lead_id, failStage, "");
  
  for(let i = 0; i < loopIterations; i++){
    await utils.sleep(waitTime);
    const activity = await leadAPI.getLeadActivity(lead.sell_do_lead_id, ActivityType.Note);
    const count = activity.results.filter((r: any) => r.note?.content === failString).length;
    expect(i).toBeLessThan(loopValidation);
      if(count == 1){
        break;
      }
  }

  // Fail Validation - 2
  await leadAPI.stageChange(lead.sell_do_lead_id, passStages[1], "");
  await leadAPI.stageChange(lead.sell_do_lead_id, failStage, "");
  
  for(let i = 0; i < loopIterations; i++){  
    await utils.sleep(waitTime);
    const activity = await leadAPI.getLeadActivity(lead.sell_do_lead_id, ActivityType.Note);
      const count = activity.results.filter((r: any) => r.note?.content === failString).length;
      expect(i).toBeLessThan(loopValidation);
      if(count == 2){
        break;
      }
  }

  // Final Pass Validation
  await leadAPI.stageChange(lead.sell_do_lead_id, passStages[1], "");
  
  for(let i = 0; i < loopIterations; i++){  
    await utils.sleep(waitTime);
    const activity = await leadAPI.getLeadActivity(lead.sell_do_lead_id, ActivityType.Note);
    const count = activity.results.filter((r: any) => r.note?.content === passString).length;
    expect(i).toBeLessThan(loopValidation);
      if(count == 4){
        break;
      }
  }

  test.info().annotations.push({
    type: `Workflow Test without delay on dummy routing client`,
    description: `For pass ${leadPass} for fail ${lead.sell_do_lead_id}` || 'Lead ID not found'
   });
});