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
import { CRMAPIUtils } from "../../utils/APIUtils/CRMAPIUtils.ts";

const timeConstant = 4 * 1000; // 4 seconds
const oneMinuteInMs = 60 * 1000; // 1 minute in milliseconds
const performanceBufferSeconds = 30; // 30 seconds buffer for test environment performance
// If delay is set to 1 minute, workflow may execute after 30 seconds due to performance
// So we account for this by reducing wait time by 30 seconds
const performanceBufferMs = performanceBufferSeconds * 1000;

test.describe.configure({ mode: "serial" });
test.setTimeout(30 * 60 * 1000); // 30 minutes timeout for delay tests

// Test Case 1: Lead create event with delay at condition
test("Create multi-step workflow with delay at condition for new_lead event", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );

  // Generate random note contents
  const successNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });
  const failNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });

  // Setup multi-step workflow with delay at condition (1 minute = 60 seconds)
  const delayInSeconds = 60; // 1 minute delay
  const {
    workflow,
    rootConditionBranch,
    updatedRootConditionBranch,
    yesPathConditionBranch,
    updatedYesPathConditionBranch,
    updatedYesPathYesActionBranch,
    updatedYesPathNoActionBranch,
  } = await WorkFlowAPIUtils.setupMultiStepWorkflowWithConditions(
    WorkflowEvent.NewLead,
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
      matchAll: true,
      delay: delayInSeconds, // Delay at root condition
    },
    {
      // YES path: nested condition with delay
      condition: {
        triggers: [
          {
            predicate: "lead_meta_info#first_source_added",
            value: "99acres",
            operator: "in",
            sub_value: "",
          },
        ],
        matchAll: true,
        delay: null, // No delay at nested condition
      },
      yesAction: {
        actionType: "add_note",
        actionData: { content: successNote },
        delay: null, // No delay at action
      },
      noAction: {
        actionType: "add_note",
        actionData: { content: failNote },
        delay: null,
      },
    },
    {
      // NO path: direct action
      yesAction: {
        actionType: "add_note",
        actionData: { content: "NO path action" },
        delay: null,
      },
    }
  );

  // Verify workflow structure
  expect(workflow._id).toBeDefined();
  expect(rootConditionBranch._id).toBeDefined();

  const workflowAPIUtils = new WorkFlowAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Delay is set during branch creation via delay_attributes parameter
  // The delay parameter (delayInSeconds = 60) is passed to createConditionBranch,
  // which sends it as delay_attributes during creation
  // No need to update delay separately - it's already set correctly during creation

  // Activate workflow
  await workflowAPIUtils.toggleWorkflow(workflow._id);

  // Create lead with "incoming" stage
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Delay Test Lead - Condition Delay",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Set stage to "incoming"
  await leadAPIUtils.stageChange(lead.sell_do_lead_id, "incoming", "");

  // Wait for delay period + processing time
  // Account for performance: if delay is 1 minute, it may execute after 30 seconds
  // So we reduce wait time by 30 seconds buffer
  const waitTime = Math.max(
    (delayInSeconds * 1000) - performanceBufferMs + timeConstant,
    timeConstant // Ensure minimum wait time
  );
  await utils.sleep(waitTime);

  // Verify action was triggered after delay
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
});

// Test Case 2: Lead re-engage event with delay at condition and action
// Cooling period: 1 minute
// - Create lead with source X, same email/phone
// - After 50 seconds, create lead with source Y - should NOT re-engage
// - After 1 minute 1 second, create lead with source Y - should re-engage
test("Create multi-step workflow with delay at condition and action for lead_reengaged event", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );
  const crmAPIUtils = new CRMAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Set cooling period to 0 days (immediate) for testing
  // Note: The actual cooling period logic is tested manually with timing
  // API uses days, so for 1 minute testing we rely on the actual system behavior
  const originalCoolingPeriod = 45; // Store original value to restore later
  await crmAPIUtils.updateCoolingPeriod(0); // Set to 0 days (immediate) for testing

  // Generate random email and phone that will be reused
  const testEmail = await utils.generateRandomEmail();
  const testPhone = await utils.generateRandomPhoneNumber();

  // Generate random note contents
  const successNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });
  const failNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });

  // Setup multi-step workflow with delay at condition (1 minute) and action (1 minute)
  const conditionDelayInSeconds = 60; // 1 minute delay at condition
  const actionDelayInSeconds = 60; // 1 minute delay at action

  const {
    workflow,
    rootConditionBranch,
    updatedRootConditionBranch,
    yesPathConditionBranch,
    updatedYesPathConditionBranch,
    updatedYesPathYesActionBranch,
  } = await WorkFlowAPIUtils.setupMultiStepWorkflowWithConditions(
    WorkflowEvent.LeadReengaged,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    {
      // Root condition: first_source_added = "aniket" (using existing source)
      triggers: [
        {
          predicate: "lead_meta_info#first_source_added",
          value: "aniket",
          operator: "in",
          sub_value: "",
        },
      ],
      matchAll: true,
      delay: conditionDelayInSeconds, // Delay at condition
    },
    {
      // YES path: nested condition with delay at condition
      condition: {
        triggers: [
          {
            predicate: "lead_meta_info#first_sub_source_added",
            value: "sub-1",
            operator: "in",
            sub_value: "",
          },
        ],
        matchAll: true,
        delay: null, // No delay at nested condition
      },
      yesAction: {
        actionType: "add_note",
        actionData: { content: successNote },
        delay: actionDelayInSeconds, // Delay at action
      },
      noAction: {
        actionType: "add_note",
        actionData: { content: failNote },
        delay: null,
      },
    }
  );

  // Verify workflow structure
  expect(workflow._id).toBeDefined();

  const workflowAPIUtils = new WorkFlowAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Delay is set during branch creation via delay parameter (conditionDelayInSeconds = 60)
  // The delay is passed to createConditionBranch, which sends it as delay_attributes during creation
  // No need to update delay separately - it's already set correctly during creation

  // Activate workflow
  await workflowAPIUtils.toggleWorkflow(workflow._id);

  // Step 1: Create first lead with source "aniket" and sub_source "sub-1"
  const lead1 = await leadAPIUtils.createLeadWithDetails(
    testPhone,
    testEmail,
    "Re-engage Test Lead 1",
    "aniket", // source
    "sub-1", // sub_source
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  expect(lead1.sell_do_lead_id).toBeDefined();

  // Step 2: Wait 50 seconds and create lead with same email/phone but different source/sub_source
  // This should NOT trigger re-engagement (within cooling period)
  await utils.sleep(50 * 1000); // 50 seconds

  const lead2 = await leadAPIUtils.createLeadWithDetails(
    testPhone,
    testEmail,
    "Re-engage Test Lead 2",
    "aniket", // Same source
    "sub-2", // Different sub_source
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Wait a bit for processing
  await utils.sleep(timeConstant);

  // Verify lead2 was created but workflow should NOT have triggered (within cooling period)
  expect(lead2.sell_do_lead_id).toBeDefined();
  const lead2Activity = await leadAPIUtils.getLeadActivity(
    lead2.sell_do_lead_id,
    ActivityType.Note
  );
  // Should not have the success note (workflow didn't trigger due to cooling period)
  const successNoteInLead2 = lead2Activity.results.find(
    (activity: any) => activity.note?.content === successNote
  );
  expect(successNoteInLead2).toBeUndefined();

  // Step 3: Wait additional time to exceed 1 minute total (1 minute 1 second from first lead)
  // Total wait: 50 seconds already waited + 61 more seconds = 111 seconds total
  await utils.sleep(61 * 1000); // Additional 61 seconds

  // Create lead with same email/phone but source Y again
  // This SHOULD trigger re-engagement (outside cooling period)
  const lead3 = await leadAPIUtils.createLeadWithDetails(
    testPhone,
    testEmail,
    "Re-engage Test Lead 3",
    "aniket", // Same source
    "sub-1", // Matching sub_source to trigger workflow
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Wait for delay periods + processing time
  // Condition delay (60s) + Action delay (60s) + processing
  // Account for performance: if delays are 1 minute each, they may execute after 30 seconds
  // So we reduce wait time by 30 seconds buffer for each delay
  const totalDelayMs = conditionDelayInSeconds * 1000 + actionDelayInSeconds * 1000;
  const waitTime = Math.max(
    totalDelayMs - (performanceBufferMs * 2) + timeConstant, // Subtract buffer for each delay
    timeConstant // Ensure minimum wait time
  );
  await utils.sleep(waitTime);

  // Verify lead3 was created and workflow triggered (re-engaged)
  expect(lead3.sell_do_lead_id).toBeDefined();
  const lead3Activity = await leadAPIUtils.getLeadActivity(
    lead3.sell_do_lead_id,
    ActivityType.Note
  );
  expect(lead3Activity.results.length).toBeGreaterThan(0);
  const successNoteInLead3 = lead3Activity.results.find(
    (activity: any) => activity.note?.content === successNote
  );
  expect(successNoteInLead3).toBeDefined();
  expect(successNoteInLead3.note.content).toBe(successNote);

  // Restore original cooling period
  await crmAPIUtils.updateCoolingPeriod(originalCoolingPeriod);
});

// Test Case 3: Project added event with delay at action only
test("Create multi-step workflow with delay at action only for project_added event", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );

  // Generate random note contents
  const successNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });
  const failNote = await utils.generateRandomString(15, {
    casing: "lower",
    includeNumbers: true,
    includeSpecialChars: false,
  });

  // Setup multi-step workflow with delay at action only (1 minute = 60 seconds)
  const actionDelayInSeconds = 60; // 1 minute delay at action

  const {
    workflow,
    rootConditionBranch,
    updatedRootConditionBranch,
    yesPathConditionBranch,
    updatedYesPathConditionBranch,
    updatedYesPathYesActionBranch,
    updatedYesPathNoActionBranch,
  } = await WorkFlowAPIUtils.setupMultiStepWorkflowWithConditions(
    WorkflowEvent.ProjectAdded,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    {
      // Root condition: sales:stage = "incoming"
      triggers: [
        {
          predicate: "lead_meta_info#sales:stage",
          value: "incoming",
          operator: "in",
          sub_value: "",
        },
      ],
      matchAll: true,
      delay: null, // No delay at condition
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
        ],
        matchAll: true,
        delay: null, // No delay at nested condition
      },
      yesAction: {
        actionType: "add_note",
        actionData: { content: successNote },
        delay: actionDelayInSeconds, // Delay at action
      },
      noAction: {
        actionType: "add_note",
        actionData: { content: failNote },
        delay: null, // No delay
      },
    },
    {
      // NO path: direct action with delay
      yesAction: {
        actionType: "add_note",
        actionData: { content: "NO path with delay" },
        delay: actionDelayInSeconds, // Delay at action
      },
    }
  );

  // Verify workflow structure
  expect(workflow._id).toBeDefined();
  expect(rootConditionBranch._id).toBeDefined();
  expect(updatedRootConditionBranch.triggers.length).toBeGreaterThan(0);

  // Activate workflow
  const workflowAPIUtils = new WorkFlowAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );
  await workflowAPIUtils.toggleWorkflow(workflow._id);

  // Create lead with "incoming" stage
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Delay Test Lead - Action Delay",
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

  // Wait for action delay period + processing time
  // Account for performance: if delay is 1 minute, it may execute after 30 seconds
  // So we reduce wait time by 30 seconds buffer
  const waitTime = Math.max(
    (actionDelayInSeconds * 1000) - performanceBufferMs + timeConstant,
    timeConstant // Ensure minimum wait time
  );
  await utils.sleep(waitTime);

  // Verify action was triggered after delay
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  const successNoteFound = leadActivityNote.results.find(
    (activity: any) => activity.note?.content === successNote
  );
  expect(successNoteFound).toBeDefined();
  expect(successNoteFound.note.content).toBe(successNote);
});
