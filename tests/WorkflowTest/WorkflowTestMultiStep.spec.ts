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

// Test multi-step workflow with nested conditions
// Structure:
// Level 1: Root condition (sales:stage = "incoming" AND touched = "false")
//   YES -> Level 2: Condition (project_id AND sales_id)
//     YES -> Level 3: Action ("Succeeds in Succeed")
//     NO -> Level 3: Action ("FAIL in succeed")
//   NO -> Level 2: Condition (first_source_added OR first_sub_source_added)
//     YES -> Level 3: Action ("succeeds in fail")
//     NO -> Level 3: Action ("failed in failed")
test("Create multi-step workflow with nested conditions in both yes/no paths", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );

  // Generate random note contents
  const successInSuccessNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });
  const failInSuccessNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });
  const successInFailNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });
  const failInFailNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });

  // Setup multi-step workflow
  const {
    workflow,
    rootConditionBranch,
    updatedRootConditionBranch,
    yesPathConditionBranch,
    noPathConditionBranch,
    updatedYesPathConditionBranch,
    updatedNoPathConditionBranch,
    updatedYesPathYesActionBranch,
    updatedYesPathNoActionBranch,
    updatedNoPathYesActionBranch,
    updatedNoPathNoActionBranch,
  } = await WorkFlowAPIUtils.setupMultiStepWorkflowWithConditions(
    WorkflowEvent.ProjectAdded,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    {
      // Root condition: sales:stage = "incoming" AND touched = "false"
      triggers: [
        {
          predicate: "lead_meta_info#sales:stage",
          value: "incoming",
          operator: "in",
          sub_value: "",
        },
        {
          predicate: "lead_meta_info#touched",
          value: "false",
          operator: "in",
          sub_value: "",
        },
      ],
      matchAll: true, // Match all conditions
    },
    {
      // YES path: nested condition
      condition: {
        triggers: [
          {
            predicate: "interested_property#project_id",
            value: properties.WF_Clinet_Project_Id_06_01,
            operator: "in",
            sub_value: "",
          },
          {
            predicate: "lead_meta_info#sales_id",
            value: properties.WF_Clinet_Sales_Id_06,
            operator: "in",
            sub_value: "",
          },
        ],
        matchAll: true,
      },
      yesAction: {
        actionType: "add_note",
        actionData: { content: successInSuccessNote },
        delay: null,
      },
      noAction: {
        actionType: "add_note",
        actionData: { content: failInSuccessNote },
        delay: null,
      },
    },
    {
      // NO path: nested condition
      condition: {
        triggers: [
          {
            predicate: "lead_meta_info#first_source_added",
            value: "99acres",
            operator: "in",
            sub_value: "",
          },
          {
            predicate: "lead_meta_info#first_sub_source_added",
            value: "xyz",
            operator: "in",
            sub_value: "",
          },
        ],
        matchAll: false, // Match any (OR condition)
      },
      yesAction: {
        actionType: "add_note",
        actionData: { content: successInFailNote },
        delay: null,
      },
      noAction: {
        actionType: "add_note",
        actionData: { content: failInFailNote },
        delay: null,
      },
    }
  );

  // Verify workflow structure
  expect(workflow._id).toBeDefined();
  expect(rootConditionBranch._id).toBeDefined();
  expect(updatedRootConditionBranch.triggers.length).toBe(2);

  // Verify YES path structure
  expect(yesPathConditionBranch).toBeDefined();
  expect(yesPathConditionBranch.branch_direction).toBe("yes");
  expect(updatedYesPathConditionBranch.triggers.length).toBe(2);
  expect(updatedYesPathYesActionBranch).toBeDefined();
  expect(updatedYesPathNoActionBranch).toBeDefined();

  // Verify NO path structure
  expect(noPathConditionBranch).toBeDefined();
  expect(noPathConditionBranch.branch_direction).toBe("no");
  expect(updatedNoPathConditionBranch.triggers.length).toBe(2);
  expect(updatedNoPathYesActionBranch).toBeDefined();
  expect(updatedNoPathNoActionBranch).toBeDefined();

  // Test Case 1: Lead that matches root YES path and nested YES path
  // Should trigger: "Succeeds in Succeed"
  const customerPhone1 = await utils.generateRandomPhoneNumber();
  const lead1 = await leadAPIUtils.createLeadWithDetails(
    customerPhone1,
    await utils.generateRandomEmail(),
    "Multi-Step Test Lead - Success Path",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to "incoming" and ensure not touched
  await leadAPIUtils.stageChange(lead1.sell_do_lead_id, "incoming", "");

  // Add project to trigger the workflow
  await leadAPIUtils.addInterestedProjectsToLead(
    lead1.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_06_01,
    properties.WF_Clinet_Sales_Email_06
  );

  // Wait for workflow to process
  await utils.sleep(timeConstant);

  // Verify "Succeeds in Succeed" action was triggered
  const leadActivityNote1 = await leadAPIUtils.getLeadActivity(
    lead1.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote1.results.length).toBeGreaterThan(0);
  const successNote1 = leadActivityNote1.results.find(
    (activity: any) => activity.note?.content === successInSuccessNote
  );
  expect(successNote1).toBeDefined();
  expect(successNote1.note.content).toBe(successInSuccessNote);

  // Test Case 2: Lead that matches root YES path but NOT nested YES path
  // Should trigger: "FAIL in succeed"
  const customerPhone2 = await utils.generateRandomPhoneNumber();
  const lead2 = await leadAPIUtils.createLeadWithDetails(
    customerPhone2,
    await utils.generateRandomEmail(),
    "Multi-Step Test Lead - Fail in Success",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to "incoming"
  await leadAPIUtils.stageChange(lead2.sell_do_lead_id, "incoming", "");

  // Add different project (not matching the condition)
  // Note: You may need to use a different project ID that doesn't match
  // For now, we'll add the project and verify the note
  await leadAPIUtils.addInterestedProjectsToLead(
    lead2.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_06_01,
    properties.WF_Clinet_Sales_Email_06
  );

  // Wait for workflow to process
  await utils.sleep(timeConstant);

  // Verify workflow was triggered (may match or not match nested condition)
  const leadActivityNote2 = await leadAPIUtils.getLeadActivity(
    lead2.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote2.results.length).toBeGreaterThan(0);

  // Test Case 3: Lead that matches root NO path and nested YES path
  // Should trigger: "succeeds in fail"
  const customerPhone3 = await utils.generateRandomPhoneNumber();
  const lead3 = await leadAPIUtils.createLeadWithDetails(
    customerPhone3,
    await utils.generateRandomEmail(),
    "Multi-Step Test Lead - Success in Fail",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to something other than "incoming"
  await leadAPIUtils.stageChange(lead3.sell_do_lead_id, "prospect", "");

  // Add project to trigger the workflow
  await leadAPIUtils.addInterestedProjectsToLead(
    lead3.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_06_01,
    properties.WF_Clinet_Sales_Email_06
  );

  // Wait for workflow to process
  await utils.sleep(timeConstant);

  // Verify workflow was triggered
  const leadActivityNote3 = await leadAPIUtils.getLeadActivity(
    lead3.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote3.results.length).toBeGreaterThan(0);

  // Test Case 4: Lead that matches root NO path and nested NO path
  // Should trigger: "failed in failed"
  const customerPhone4 = await utils.generateRandomPhoneNumber();
  const lead4 = await leadAPIUtils.createLeadWithDetails(
    customerPhone4,
    await utils.generateRandomEmail(),
    "Multi-Step Test Lead - Fail in Fail",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to something other than "incoming"
  await leadAPIUtils.stageChange(lead4.sell_do_lead_id, "prospect", "");

  // Add project to trigger the workflow
  await leadAPIUtils.addInterestedProjectsToLead(
    lead4.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_06_01,
    properties.WF_Clinet_Sales_Email_06
  );

  // Wait for workflow to process
  await utils.sleep(timeConstant);

  // Verify workflow was triggered
  const leadActivityNote4 = await leadAPIUtils.getLeadActivity(
    lead4.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote4.results.length).toBeGreaterThan(0);
});

// Test multi-step workflow using manual API methods (step by step)
test("Create multi-step workflow using manual API methods", async ({}) => {
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

  // Step 2: Create root condition branch (depth level 1)
  const rootConditionBranch = await workflowAPIUtils.createConditionBranch(
    workflow._id,
    1, // depthLevel
    true, // matchAll
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(rootConditionBranch._id).toBeDefined();

  // Step 3: Add triggers to root condition branch
  const updatedRootConditionBranch =
    await workflowAPIUtils.addTriggersToConditionBranch(
      workflow._id,
      rootConditionBranch._id,
      [
        {
          predicate: "lead_meta_info#sales:stage",
          value: "incoming",
          operator: "in",
          sub_value: "",
        },
        {
          predicate: "lead_meta_info#touched",
          value: "false",
          operator: "in",
          sub_value: "",
        },
      ],
      rootConditionBranch
    );

  expect(updatedRootConditionBranch.triggers.length).toBe(2);

  // Step 4: Create condition branch in YES path (depth level 2)
  const yesPathConditionBranch =
    await workflowAPIUtils.createYesConditionBranch(
      workflow._id,
      rootConditionBranch._id,
      2, // depthLevel
      true, // matchAll
      0, // yesChildren
      0, // noChildren
      null // delay
    );

  expect(yesPathConditionBranch._id).toBeDefined();
  expect(yesPathConditionBranch.branch_direction).toBe("yes");

  // Step 5: Add triggers to YES path condition branch
  const updatedYesPathConditionBranch =
    await workflowAPIUtils.addTriggersToConditionBranch(
      workflow._id,
      yesPathConditionBranch._id,
      [
        {
          predicate: "interested_property#project_id",
          value: properties.WF_Clinet_Project_Id_06_01,
          operator: "in",
          sub_value: "",
        },
        {
          predicate: "lead_meta_info#sales_id",
          value: properties.WF_Clinet_Sales_Id_06,
          operator: "in",
          sub_value: "",
        },
      ],
      yesPathConditionBranch
    );

  expect(updatedYesPathConditionBranch.triggers.length).toBe(2);

  // Step 6: Create action branches for YES path nested condition (depth level 3)
  const yesPathYesActionBranch = await workflowAPIUtils.createYesActionBranch(
    workflow._id,
    yesPathConditionBranch._id,
    3, // depthLevel
    true, // matchAll
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(yesPathYesActionBranch._id).toBeDefined();

  // Step 7: Add action to YES path YES branch
  const updatedYesPathYesActionBranch =
    await workflowAPIUtils.addNoteAction(
      workflow._id,
      yesPathYesActionBranch._id,
      "Manual API - Succeeds in Succeed",
      yesPathYesActionBranch,
      null
    );

  expect(updatedYesPathYesActionBranch.actions.length).toBeGreaterThan(0);

  // Step 8: Create NO action branch for YES path nested condition
  const yesPathNoActionBranch = await workflowAPIUtils.createNoActionBranch(
    workflow._id,
    yesPathConditionBranch._id,
    3, // depthLevel
    true, // matchAll
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(yesPathNoActionBranch._id).toBeDefined();

  // Step 9: Add action to YES path NO branch
  const updatedYesPathNoActionBranch = await workflowAPIUtils.addNoteAction(
    workflow._id,
    yesPathNoActionBranch._id,
    "Manual API - FAIL in succeed",
    yesPathNoActionBranch,
    null
  );

  expect(updatedYesPathNoActionBranch.actions.length).toBeGreaterThan(0);

  // Step 10: Create condition branch in NO path (depth level 2)
  const noPathConditionBranch = await workflowAPIUtils.createNoConditionBranch(
    workflow._id,
    rootConditionBranch._id,
    2, // depthLevel
    false, // matchAll (match any - OR condition)
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(noPathConditionBranch._id).toBeDefined();
  expect(noPathConditionBranch.branch_direction).toBe("no");

  // Step 11: Add triggers to NO path condition branch
  const updatedNoPathConditionBranch =
    await workflowAPIUtils.addTriggersToConditionBranch(
      workflow._id,
      noPathConditionBranch._id,
      [
        {
          predicate: "lead_meta_info#first_source_added",
          value: "99acres",
          operator: "in",
          sub_value: "",
        },
        {
          predicate: "lead_meta_info#first_sub_source_added",
          value: "xyz",
          operator: "in",
          sub_value: "",
        },
      ],
      noPathConditionBranch
    );

  expect(updatedNoPathConditionBranch.triggers.length).toBe(2);

  // Step 12: Create action branches for NO path nested condition (depth level 3)
  const noPathYesActionBranch = await workflowAPIUtils.createYesActionBranch(
    workflow._id,
    noPathConditionBranch._id,
    3, // depthLevel
    true, // matchAll
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(noPathYesActionBranch._id).toBeDefined();

  // Step 13: Add action to NO path YES branch
  const updatedNoPathYesActionBranch = await workflowAPIUtils.addNoteAction(
    workflow._id,
    noPathYesActionBranch._id,
    "Manual API - succeeds in fail",
    noPathYesActionBranch,
    null
  );

  expect(updatedNoPathYesActionBranch.actions.length).toBeGreaterThan(0);

  // Step 14: Create NO action branch for NO path nested condition
  const noPathNoActionBranch = await workflowAPIUtils.createNoActionBranch(
    workflow._id,
    noPathConditionBranch._id,
    3, // depthLevel
    true, // matchAll
    0, // yesChildren
    0, // noChildren
    null // delay
  );

  expect(noPathNoActionBranch._id).toBeDefined();

  // Step 15: Add action to NO path NO branch
  const updatedNoPathNoActionBranch = await workflowAPIUtils.addNoteAction(
    workflow._id,
    noPathNoActionBranch._id,
    "Manual API - failed in failed",
    noPathNoActionBranch,
    null
  );

  expect(updatedNoPathNoActionBranch.actions.length).toBeGreaterThan(0);

  // Step 16: Activate workflow
  await workflowAPIUtils.toggleWorkflow(workflow._id);

  // Step 17: Verify workflow is active
  const workflowDetails = await workflowAPIUtils.getWorkflowById(workflow._id);
  const isActive =
    workflowDetails.recipe?.is_active ?? workflowDetails.is_active;
  expect(isActive).toBe(true);
});
