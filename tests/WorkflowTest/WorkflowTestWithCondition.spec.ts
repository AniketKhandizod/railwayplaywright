import { test, expect } from "@playwright/test";
import {
  WorkFlowAPIUtils,
  WorkflowEvent,
} from "../../utils/APIUtils/WorkFlowAPIUtils.ts";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import {
  ActivityType,
  LeadAPIUtils,
} from "../../utils/APIUtils/LeadAPIUtils.ts";

const timeConstant = 4 * 1000; // 4 seconds

test.describe.configure({ mode: "serial" });
test.setTimeout(15 * 60 * 1000);

// Test workflow with condition: sales stage equals "incoming"
// When condition is true (yes branch): add note "hello world"
// When condition is false (no branch): add note "Hello"
test("Create workflow with condition (sales stage = incoming) and verify yes/no branch actions", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );

  const successNote = await utils.generateRandomString(10, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });
  const failureNote = await utils.generateRandomString(10, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });

  // Setup workflow with condition
  const {
    workflow,
    conditionBranch,
    updatedConditionBranch,
    yesBranch,
    noBranch,
    updatedYesBranch,
    updatedNoBranch,
  } = await WorkFlowAPIUtils.setupWorkflowWithCondition(
    WorkflowEvent.ProjectAdded,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    {
      predicate: "lead_meta_info#sales:stage",
      value: "incoming",
      operator: "in",
      matchAll: true,
    },
    {
      actionType: "add_note",
      actionData: { content: successNote },
      delay: null,
    },
    {
      actionType: "add_note",
      actionData: { content: failureNote },
      delay: null,
    }
  );

  // Verify workflow structure
  expect(workflow._id).toBeDefined();
  expect(conditionBranch._id).toBeDefined();
  expect(updatedConditionBranch.triggers).toBeDefined();
  expect(updatedConditionBranch.triggers.length).toBeGreaterThan(0);
  expect(updatedConditionBranch.triggers[0].predicate).toBe(
    "lead_meta_info#sales:stage"
  );
  expect(updatedConditionBranch.triggers[0].value).toBe("incoming");
  expect(updatedConditionBranch.triggers[0].operator).toBe("in");

  // Verify yes branch
  expect(yesBranch).toBeDefined();
  expect(yesBranch.branch_direction).toBe("yes");
  expect(updatedYesBranch.actions).toBeDefined();
  expect(updatedYesBranch.actions.length).toBeGreaterThan(0);
  expect(updatedYesBranch.actions[0].task_action.action_type).toBe("add_note");
  expect(updatedYesBranch.actions[0].task_action.data.content).toBe(successNote);

  // Verify no branch
  expect(noBranch).toBeDefined();
  expect(noBranch.branch_direction).toBe("no");
  expect(updatedNoBranch.actions).toBeDefined();
  expect(updatedNoBranch.actions.length).toBeGreaterThan(0);
  expect(updatedNoBranch.actions[0].task_action.action_type).toBe("add_note");
  expect(updatedNoBranch.actions[0].task_action.data.content).toBe(failureNote);

  // Test Case 1: Create lead with "incoming" stage - should trigger YES branch
  const customerPhone1 = await utils.generateRandomPhoneNumber();
  const lead1 = await leadAPIUtils.createLeadWithDetails(
    customerPhone1,
    await utils.generateRandomEmail(),
    "Condition Test Lead - Incoming Stage",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to "incoming"
  await leadAPIUtils.stageChange(lead1.sell_do_lead_id, "incoming", "");

  // Add project to trigger the workflow
  await leadAPIUtils.addInterestedProjectsToLead(
    lead1.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_06_01,
    properties.WF_Clinet_Sales_Email_06
  );

  // Wait for workflow to process
  await utils.sleep(timeConstant);

  // Verify YES branch action was triggered (should have "hello world" note)
  const leadActivityNote1 = await leadAPIUtils.getLeadActivity(
    lead1.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote1.results.length).toBeGreaterThan(0);
  const yesBranchNote = leadActivityNote1.results.find(
    (activity: any) => activity.note?.content === successNote
  );
  expect(yesBranchNote).toBeDefined();
  expect(yesBranchNote.note.content).toBe(successNote);

  // Test Case 2: Create lead with different stage - should trigger NO branch
  const customerPhone2 = await utils.generateRandomPhoneNumber();
  const lead2 = await leadAPIUtils.createLeadWithDetails(
    customerPhone2,
    await utils.generateRandomEmail(),
    "Condition Test Lead - Other Stage",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to something other than "incoming" (e.g., "qualified")
  await leadAPIUtils.stageChange(lead2.sell_do_lead_id, "prospect", "");
  // Add project to trigger the workflow
  await leadAPIUtils.addInterestedProjectsToLead(
    lead2.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_06_01,
    properties.WF_Clinet_Sales_Email_06
  );

  // Wait for workflow to process
  await utils.sleep(timeConstant);

  // Verify NO branch action was triggered (should have "Hello" note)
  const leadActivityNote2 = await leadAPIUtils.getLeadActivity(
    lead2.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote2.results.length).toBeGreaterThan(0);
  const noBranchNote = leadActivityNote2.results.find(
    (activity: any) => activity.note?.content === failureNote
  );
  expect(noBranchNote).toBeDefined();
  expect(noBranchNote.note.content).toBe(failureNote);
});

// Test workflow with condition: only YES branch (no NO branch action)
test("Create workflow with condition and only yes branch action", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );

  // Setup workflow with condition - only yes branch
  const {
    workflow,
    conditionBranch,
    updatedConditionBranch,
    yesBranch,
    updatedYesBranch,
  } = await WorkFlowAPIUtils.setupWorkflowWithCondition(
    WorkflowEvent.ProjectAdded,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    {
      predicate: "lead_meta_info#sales:stage",
      value: "incoming",
      operator: "in",
      matchAll: true,
    },
    {
      actionType: "add_note",
      actionData: { content: "Condition matched!" },
      delay: null,
    }
    // No noActionConfig - only yes branch
  );

  // Verify workflow structure
  expect(workflow._id).toBeDefined();
  expect(conditionBranch._id).toBeDefined();
  expect(updatedConditionBranch.triggers.length).toBeGreaterThan(0);

  // Verify yes branch exists
  expect(yesBranch).toBeDefined();
  expect(updatedYesBranch.actions.length).toBeGreaterThan(0);
  expect(updatedYesBranch.actions[0].task_action.data.content).toBe(
    "Condition matched!"
  );

  // Create lead with "incoming" stage
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Condition Test Lead - Yes Branch Only",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to "incoming"
  await leadAPIUtils.stageChange(lead.sell_do_lead_id, "incoming", "");

  // Add project to trigger the workflow
  await leadAPIUtils.addInterestedProjectsToLead(
    lead.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_06_01,
    properties.WF_Clinet_Sales_Email_06
  );

  // Wait for workflow to process
  await utils.sleep(timeConstant);

  // Verify YES branch action was triggered
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  const yesBranchNote = leadActivityNote.results.find(
    (activity: any) => activity.note?.content === "Condition matched!"
  );
  expect(yesBranchNote).toBeDefined();
  expect(yesBranchNote.note.content).toBe("Condition matched!");
});

// Test workflow with condition: only NO branch (no YES branch action)
test("Create workflow with condition and only no branch action", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );

  // Setup workflow with condition - only no branch
  const {
    workflow,
    conditionBranch,
    updatedConditionBranch,
    noBranch,
    updatedNoBranch,
  } = await WorkFlowAPIUtils.setupWorkflowWithCondition(
    WorkflowEvent.ProjectAdded,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    {
      predicate: "lead_meta_info#sales:stage",
      value: "incoming",
      operator: "in",
      matchAll: true,
    },
    undefined, // No yesActionConfig
    {
      actionType: "add_note",
      actionData: { content: "Condition not matched!" },
      delay: null,
    }
  );

  // Verify workflow structure
  expect(workflow._id).toBeDefined();
  expect(conditionBranch._id).toBeDefined();
  expect(updatedConditionBranch.triggers.length).toBeGreaterThan(0);

  // Verify no branch exists
  expect(noBranch).toBeDefined();
  expect(updatedNoBranch.actions.length).toBeGreaterThan(0);
  expect(updatedNoBranch.actions[0].task_action.data.content).toBe(
    "Condition not matched!"
  );

  // Create lead with different stage (not "incoming")
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Condition Test Lead - No Branch Only",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to something other than "incoming"
  await leadAPIUtils.stageChange(lead.sell_do_lead_id, "prospect", "");

  // Add project to trigger the workflow
  await leadAPIUtils.addInterestedProjectsToLead(
    lead.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_06_01,
    properties.WF_Clinet_Sales_Email_06
  );

  // Wait for workflow to process
  await utils.sleep(timeConstant);

  // Verify NO branch action was triggered
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  const noBranchNote = leadActivityNote.results.find(
    (activity: any) => activity.note?.content === "Condition not matched!"
  );
  expect(noBranchNote).toBeDefined();
  expect(noBranchNote.note.content).toBe("Condition not matched!");
});

// Test workflow with condition using manual API methods (step by step)
test("Create workflow with condition using manual API methods", async ({}) => {
  const utils = new Utils();
  const workflowAPIUtils = new WorkFlowAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Generate random workflow name and description
  const workflowName = await utils.generateRandomString(10, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });
  const workflowDescription = await utils.generateRandomString(20, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });

  // Deactivate all active workflows
  await workflowAPIUtils.deactivateAllActiveWorkflows();

  // Step 1: Create workflow with event
  const workflow = await workflowAPIUtils.createWorkflowWithEvent(
    workflowName,
    workflowDescription,
    WorkflowEvent.ProjectAdded,
    false, // isActive
    false, // isDefault
    0 // maxDepthLevel
  );

  expect(workflow._id).toBeDefined();
  expect(workflow.event).toBe(WorkflowEvent.ProjectAdded);

  // Step 2: Create condition branch
  const conditionBranch = await workflowAPIUtils.createConditionBranch(
    workflow._id,
    1, // depthLevel
    true, // matchAll
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(conditionBranch._id).toBeDefined();
  expect(conditionBranch.branch_type).toBe("condition");

  // Step 3: Add triggers to condition branch
  const updatedConditionBranch = await workflowAPIUtils.addTriggersToConditionBranch(
    workflow._id,
    conditionBranch._id,
    [
      {
        predicate: "lead_meta_info#sales:stage",
        value: "incoming",
        operator: "in",
        sub_value: "",
      },
    ],
    conditionBranch
  );

  expect(updatedConditionBranch.triggers.length).toBeGreaterThan(0);
  expect(updatedConditionBranch.triggers[0].predicate).toBe(
    "lead_meta_info#sales:stage"
  );

  // Step 4: Create yes action branch
  const yesBranch = await workflowAPIUtils.createYesActionBranch(
    workflow._id,
    conditionBranch._id,
    2, // depthLevel
    true, // matchAll
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(yesBranch._id).toBeDefined();
  expect(yesBranch.branch_direction).toBe("yes");

  // Step 5: Add action to yes branch
  const updatedYesBranch = await workflowAPIUtils.addNoteAction(
    workflow._id,
    yesBranch._id,
    "Manual API Test - Yes Branch",
    yesBranch,
    null
  );

  expect(updatedYesBranch.actions.length).toBeGreaterThan(0);

  // Step 6: Create no action branch
  const noBranch = await workflowAPIUtils.createNoActionBranch(
    workflow._id,
    conditionBranch._id,
    2, // depthLevel
    true, // matchAll
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(noBranch._id).toBeDefined();
  expect(noBranch.branch_direction).toBe("no");

  // Step 7: Add action to no branch
  const updatedNoBranch = await workflowAPIUtils.addNoteAction(
    workflow._id,
    noBranch._id,
    "Manual API Test - No Branch",
    noBranch,
    null
  );

  expect(updatedNoBranch.actions.length).toBeGreaterThan(0);

  // Step 8: Activate workflow
  await workflowAPIUtils.toggleWorkflow(workflow._id);

  // Verify workflow is active
  const workflowDetails = await workflowAPIUtils.getWorkflowById(workflow._id);
  const isActive =
    workflowDetails.recipe?.is_active ?? workflowDetails.is_active;
  expect(isActive).toBe(true);
});


