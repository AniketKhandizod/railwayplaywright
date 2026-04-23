import { test, expect } from "@playwright/test";
import {
  WorkFlowAPIUtils,
  WorkflowEvent,
} from "../../utils/APIUtils/WorkFlowAPIUtils.ts";
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import {
  ActivityType,
  FollowupType,
  LeadAPIUtils,
  SiteVisitAction,
} from "../../utils/APIUtils/LeadAPIUtils.ts";
import {
  CallDirection,
  CalligAPIUtils,
  CallStatus,
  OfflineCallStrategy,
} from "../../utils/APIUtils/CallingAPIUtils.ts";
import { CRMAPIUtils } from "../../utils/APIUtils/CRMAPIUtils.ts";
const timeConstant = 4 * 1000; // 4 seconds

//test.describe.configure({ mode: "serial" });
// On mini mind client
test.setTimeout(15 * 60 * 1000);

// 1) Tested New lead created event
test("Create workflow with note action via API and activate it and verify the note action", async ({}) => {
  const utils = new Utils();
  const crmAPIUtils = new CRMAPIUtils(properties.WF_Client_Id_01, properties.WF_Client_FullAccess_API_01);
  await crmAPIUtils.updateWorkflowEditAccess(true);
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.NewLead,
    properties.WF_Client_Id_01,
    properties.WF_Client_FullAccess_API_01
  );

  // Create a lead
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_01,
    properties.WF_Client_FullAccess_API_01,
    properties.WF_Client_RestrictedAccess_API_01
  );
  const lead = await leadAPIUtils.createLeadWithDetails(
    await utils.generateRandomPhoneNumber(),
    await utils.generateRandomEmail(),
    "One Workflow Lead",
    "",
    "",
    "",
    properties.Sales_id,
    ""
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // get lead activity note
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});

// 2) Tested new call created event
test("Create workflow with new call created event and activate it and verify the new call created action", async ({}) => {
  const crmAPIUtils = new CRMAPIUtils(properties.WF_Client_Id_02, properties.WF_Client_FullAccess_API_02);
  await crmAPIUtils.updateWorkflowEditAccess(true);
  const utils = new Utils();
  const callingAPIUtils = new CalligAPIUtils(
    properties.WF_Client_Id_02,
    properties.WF_Client_FullAccess_API_02
  );
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_02,
    properties.WF_Client_FullAccess_API_02,
    properties.WF_Client_RestrictedAccess_API_02
  );
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.NewCallCreated,
    properties.WF_Client_Id_02,
    properties.WF_Client_FullAccess_API_02
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Two Workflow Lead",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_02,
    ""
  );

  // Create a call
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Incoming,
    CallStatus.Answered,
    1,
    properties.WF_Clinet_Sales_Email_02,
    false
  );
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Incoming,
    CallStatus.NotAnswered,
    1,
    properties.WF_Clinet_Sales_Email_02,
    false
  );
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Outgoing,
    CallStatus.Answered,
    1,
    properties.WF_Clinet_Sales_Email_02,
    false
  );
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Outgoing,
    CallStatus.NotAnswered,
    1,
    properties.WF_Clinet_Sales_Email_02,
    false
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results.length).toBe(4);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results[1].note.content).toBe(noteContent);
  expect(leadActivityNote.results[2].note.content).toBe(noteContent);
  expect(leadActivityNote.results[3].note.content).toBe(noteContent);
});

// 3) Tested New incoming call not answered event
test("Create workflow with new incoming call answered event and activate it and verify the incoming call answered action", async ({}) => {
  const crmAPIUtils = new CRMAPIUtils(properties.WF_Client_Id_03, properties.WF_Client_FullAccess_API_03);
  await crmAPIUtils.updateWorkflowEditAccess(true);

  const utils = new Utils();
  const callingAPIUtils = new CalligAPIUtils(
    properties.WF_Client_Id_03,
    properties.WF_Client_FullAccess_API_03
  );
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_03,
    properties.WF_Client_FullAccess_API_03,
    properties.WF_Client_RestrictedAccess_API_03
  );
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.IncomingCallAnswered,
    properties.WF_Client_Id_03,
    properties.WF_Client_FullAccess_API_03
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Three Workflow Lead",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_03,
    ""
  );

  // Create a call
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Incoming,
    CallStatus.Answered,
    1,
    properties.WF_Clinet_Sales_Email_03,
    false
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});

// 4) Tested New incoming call not answered event
test("Create workflow with new incoming call not answered event and activate it and verify the incoming call not answered action", async ({}) => {
  const crmAPIUtils = new CRMAPIUtils(properties.WF_Client_Id_04, properties.WF_Client_FullAccess_API_04);
  await crmAPIUtils.updateWorkflowEditAccess(true);
  const utils = new Utils();
  const callingAPIUtils = new CalligAPIUtils(
    properties.WF_Client_Id_04,
    properties.WF_Client_FullAccess_API_04
  );
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_04,
    properties.WF_Client_FullAccess_API_04,
    properties.WF_Client_RestrictedAccess_API_04
  );
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.IncomingCallNotAnswered,
    properties.WF_Client_Id_04,
    properties.WF_Client_FullAccess_API_04
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Four Workflow Lead",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_04,
    ""
  );

  // Create a call
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Incoming,
    CallStatus.NotAnswered,
    1,
    properties.WF_Clinet_Sales_Email_04,
    false
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});

// 5) Tested New outgoing call answered event
test("Create workflow with new outgoing call answered event and activate it and verify the outgoing call answered action", async ({}) => {
  const crmAPIUtils = new CRMAPIUtils(properties.WF_Client_Id_05, properties.WF_Client_FullAccess_API_05);
  await crmAPIUtils.updateWorkflowEditAccess(true);
  const utils = new Utils();
  const callingAPIUtils = new CalligAPIUtils(
    properties.WF_Client_Id_05,
    properties.WF_Client_FullAccess_API_05
  );
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_05,
    properties.WF_Client_FullAccess_API_05,
    properties.WF_Client_RestrictedAccess_API_05
  );
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.OutgoingCallAnswered,
    properties.WF_Client_Id_05,
    properties.WF_Client_FullAccess_API_05
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Five Workflow Lead",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_05,
    ""
  );

  // Create a call
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Outgoing,
    CallStatus.Answered,
    1,
    properties.WF_Clinet_Sales_Email_05,
    false
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});

// 6) Tested New outgoing call not answered event
test("Create workflow with new outgoing call not answered event and activate it and verify the outgoing call not answered action", async ({}) => {
  const crmAPIUtils = new CRMAPIUtils(properties.WF_Client_Id_06, properties.WF_Client_FullAccess_API_06);
  await crmAPIUtils.updateWorkflowEditAccess(true);
  const utils = new Utils();
  const callingAPIUtils = new CalligAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.OutgoingCallNotAnswered,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Six Workflow Lead",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // Create a call
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Outgoing,
    CallStatus.NotAnswered,
    1,
    properties.WF_Clinet_Sales_Email_06,
    false
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});

// 6) Tested call scored event
test.fixme(
  "Create workflow with call scored event and activate it and verify the call scored action",
  async ({}) => {
    const utils = new Utils();
    const callingAPIUtils = new CalligAPIUtils(
      properties.WF_Client_Id_06,
      properties.WF_Client_FullAccess_API_06
    );
    const leadAPIUtils = new LeadAPIUtils(
      properties.WF_Client_Id_06,
      properties.WF_Client_FullAccess_API_06,
      properties.WF_Client_RestrictedAccess_API_06
    );
    const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
      WorkflowEvent.CallScoreUpdated,
      properties.WF_Client_Id_06,
      properties.WF_Client_FullAccess_API_06
    );

    // Create a lead
    const customerPhone = await utils.generateRandomPhoneNumber();
    const lead = await leadAPIUtils.createLeadWithDetails(
      customerPhone,
      await utils.generateRandomEmail(),
      "Seven Workflow Lead",
      "",
      "",
      "",
      properties.WF_Clinet_Sales_Id_06,
      ""
    );

    console.log("leadID:", lead.sell_do_lead_id);
    // Create a call
    await callingAPIUtils.AddOfflineCall(
      lead.sell_do_lead_id,
      CallDirection.Incoming,
      CallStatus.Answered,
      1,
      properties.WF_Clinet_Sales_Email_06,
      false
    );
    await callingAPIUtils.AddOfflineCall(
      lead.sell_do_lead_id,
      CallDirection.Incoming,
      CallStatus.Answered,
      1,
      properties.WF_Clinet_Sales_Email_06,
      false
    );

    // wait for 2 seconds
    await utils.sleep(timeConstant);

    // reterive lead details
    const leadActivityNote = await leadAPIUtils.getLeadActivity(
      lead.sell_do_lead_id,
      ActivityType.Note
    );
    expect(leadActivityNote.results.length).toBeGreaterThan(0);
    expect(leadActivityNote.results[0].note.content).toBe(noteContent);
    expect(leadActivityNote.results.length).toBe(1);
  }
);

// 7) Tested New project added event
test("Create workflow with new project added event and activate it and verify the project added action", async ({}) => {
  const crmAPIUtils = new CRMAPIUtils(properties.WF_Client_Id_07, properties.WF_Client_FullAccess_API_07);
  await crmAPIUtils.updateWorkflowEditAccess(true);
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_07,
    properties.WF_Client_FullAccess_API_07,
    properties.WF_Client_RestrictedAccess_API_07
  );
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.ProjectAdded,
    properties.WF_Client_Id_07,
    properties.WF_Client_FullAccess_API_07
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Eight Workflow Lead",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_07,
    ""
  );

  // Add interested projects to lead
  await leadAPIUtils.addInterestedProjectsToLead(
    lead.sell_do_lead_id,
    properties.WF_Clinet_Project_Id_07,
    properties.WF_Clinet_Sales_Email_07
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});

// 8) Tested site visit scheduled event
test("Create workflow with site visit scheduled event and activate it and verify the site visit scheduled action", async ({}) => {
  const utils = new Utils();
  const crmAPIUtils = new CRMAPIUtils(
    properties.WF_Client_Id_08,
    properties.WF_Client_FullAccess_API_08
  );
  await crmAPIUtils.updateWorkflowEditAccess(true);

  // Disable site visit experience feature
  await crmAPIUtils.updateSiteVisitExperience(false);

  await crmAPIUtils.resetActivityConfiguration();

  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_08,
    properties.WF_Client_FullAccess_API_08,
    properties.WF_Client_RestrictedAccess_API_08
  );
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.SitevisitScheduled,
    properties.WF_Client_Id_08,
    properties.WF_Client_FullAccess_API_08
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Nine Workflow Lead",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_08,
    ""
  );

  // 1) create site visit conducted
  const startDate_01 =
    (await utils.calculateFutureDate(AheadOf.Minute, 15, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_01 =
    (await utils.calculateFutureDate(AheadOf.Minute, 45, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_01 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_01,
    endDate_01,
    properties.WF_Clinet_Sales_Email_08,
    properties.WF_Clinet_Project_Id_08,
    false
  );

  // update site visit status to conducted
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_01.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_08,
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

  // 2) create site visit dropped
  const startDate_02 =
    (await utils.calculateFutureDate(AheadOf.Minute, 45, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_02 =
    (await utils.calculateFutureDate(AheadOf.Minute, 75, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_02 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_02,
    endDate_02,
    properties.WF_Clinet_Sales_Email_08,
    properties.WF_Clinet_Project_Id_08,
    false
  );

  // update site visit status to dropped
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_02.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_08,
    SiteVisitAction.Dropped
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(2);

  // 3) create site visit rescheduled
  const startDate_03 =
    (await utils.calculateFutureDate(AheadOf.Minute, 60, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_03 =
    (await utils.calculateFutureDate(AheadOf.Minute, 90, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_03 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_03,
    endDate_03,
    properties.WF_Clinet_Sales_Email_08,
    properties.WF_Clinet_Project_Id_08,
    false
  );

  // update site visit status to rescheduled
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_03.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_08,
    SiteVisitAction.Rescheduled
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(3);

  // 4) create site visit missed
  const startDate_04 =
    (await utils.calculateFutureDate(AheadOf.Minute, 30, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_04 =
    (await utils.calculateFutureDate(AheadOf.Minute, 60, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_04 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_04,
    endDate_04,
    properties.WF_Clinet_Sales_Email_08,
    properties.WF_Clinet_Project_Id_08,
    false
  );

  // update site visit status to missed
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_04.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_08,
    SiteVisitAction.Missed
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(4);

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(4);
});

// 6) Tested site visit conducted event
test("Create workflow with site visit conducted event and activate it and verify the site visit conducted action", async ({}) => {
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

  // Disable site visit experience feature
  await crmAPIUtils.updateSiteVisitExperience(false);

  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.SitevisitConducted,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Ten Workflow Lead",
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
  await utils.sleep(timeConstant);
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(1);

  // 2) create site visit dropped
  const startDate_02 =
    (await utils.calculateFutureDate(AheadOf.Minute, 65, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_02 =
    (await utils.calculateFutureDate(AheadOf.Minute, 75, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_02 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_02,
    endDate_02,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_03,
    false
  );

  // update site visit status to dropped
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_02.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Dropped
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(1);

  // 3) create site visit rescheduled
  const startDate_03 =
    (await utils.calculateFutureDate(AheadOf.Minute, 80, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_03 =
    (await utils.calculateFutureDate(AheadOf.Minute, 90, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_03 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_03,
    endDate_03,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_04,
    false
  );

  // update site visit status to rescheduled
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_03.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Rescheduled
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(1);

  // 4) create site visit missed
  const startDate_04 =
    (await utils.calculateFutureDate(AheadOf.Minute, 50, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_04 =
    (await utils.calculateFutureDate(AheadOf.Minute, 60, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_04 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_04,
    endDate_04,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_02,
    false
  );

  // update site visit status to missed
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_04.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Missed
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(1);

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});

// 7) Tested site visit dropped event
test("Create workflow with site visit dropped event and activate it and verify the site visit dropped action", async ({}) => {
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

  // Disable site visit experience feature
  await crmAPIUtils.updateSiteVisitExperience(false);

  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.SitevisitDropped,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "",
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
  ).toBe(0);

  // 2) create site visit dropped
  const startDate_03 =
    (await utils.calculateFutureDate(AheadOf.Minute, 65, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_03 =
    (await utils.calculateFutureDate(AheadOf.Minute, 75, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_03 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_03,
    endDate_03,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_03,
    false
  );

  // update site visit status to dropped
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_03.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Dropped
  );
  await utils.sleep(timeConstant);
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(1);

  // 3) create site visit rescheduled
  const startDate_04 =
    (await utils.calculateFutureDate(AheadOf.Minute, 80, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_04 =
    (await utils.calculateFutureDate(AheadOf.Minute, 90, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_04 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_04,
    endDate_04,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_04,
    false
  );

  // update site visit status to rescheduled
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_04.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Rescheduled
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(1);

  // 4) create site visit missed
  const startDate_02 =
    (await utils.calculateFutureDate(AheadOf.Minute, 50, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_02 =
    (await utils.calculateFutureDate(AheadOf.Minute, 60, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_02 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_02,
    endDate_02,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_02,
    false
  );

  // update site visit status to missed
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_02.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Missed
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});

// 8) Tested site visit missed event
test("Create workflow with site visit missed event and activate it and verify the site visit missed action", async ({}) => {
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

  // Disable site visit experience feature
  await crmAPIUtils.updateSiteVisitExperience(false);

  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.SitevisitMissed,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "",
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
  ).toBe(0);

  // 2) create site visit dropped
  const startDate_03 =
    (await utils.calculateFutureDate(AheadOf.Minute, 65, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_03 =
    (await utils.calculateFutureDate(AheadOf.Minute, 75, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_03 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_03,
    endDate_03,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_03,
    false
  );

  // update site visit status to dropped
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_03.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Dropped
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(0);

  // 3) create site visit rescheduled
  const startDate_04 =
    (await utils.calculateFutureDate(AheadOf.Minute, 80, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_04 =
    (await utils.calculateFutureDate(AheadOf.Minute, 90, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_04 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_04,
    endDate_04,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_04,
    false
  );

  // update site visit status to rescheduled
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_04.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Rescheduled
  );
  expect(
    (
      await leadAPIUtils.getLeadActivity(
        lead.sell_do_lead_id,
        ActivityType.Note
      )
    ).results.length
  ).toBe(0);

  // 4) create site visit missed
  const startDate_02 =
    (await utils.calculateFutureDate(AheadOf.Minute, 50, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_02 =
    (await utils.calculateFutureDate(AheadOf.Minute, 60, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_02 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_02,
    endDate_02,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_02,
    false
  );

  // update site visit status to missed
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit_02.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Missed
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);
});


// 9) Tested site visit pending event
test("Create workflow with site visit pending event and activate it and verify the site visit pending action", async ({}) => {
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

  // Disable site visit experience feature
  await crmAPIUtils.updateSiteVisitExperience(false);

  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.SitevisitPending,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Eleven Workflow Lead",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  // 1) create site visit conducted
  const startDate_01 =
    (await utils.calculateFutureDate(AheadOf.Minute, -90, "yyyy-MM-dd HH:mm")) +
    " IST";
  const endDate_01 =
    (await utils.calculateFutureDate(AheadOf.Minute, -60, "yyyy-MM-dd HH:mm")) +
    " IST";
  const siteVisit_01 = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate_01,
    endDate_01,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_01,
    false
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(2); // BUG
});

test("Create workflow with follow up scheduled event and activate it and verify the follow up scheduled action", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );

  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.FollowupScheduled,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Twelve Workflow follow up scheduled",
    "",
    "",
    "", 
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  const startDate = await utils.calculateFutureDate(AheadOf.Minute, 10, "yyyy-MM-dd HH:mm") + " IST";
  await leadAPIUtils.scheduleFollowup(
    lead.sell_do_lead_id,
    startDate,
    properties.WF_Clinet_Sales_Email_06,
    FollowupType.Call,
    "Test Subject",
    "Test Agenda"
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1); 
});

test("Create workflow with follow up conducted event and activate it and verify the follow up conducted action", async ({}) => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );

  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.FollowupConducted,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Twelve Workflow follow up conducted",
    "",
    "",
    "", 
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

  const startDate = await utils.calculateFutureDate(AheadOf.Minute, 10, "yyyy-MM-dd HH:mm") + " IST";
  const followup = await leadAPIUtils.scheduleFollowup(
    lead.sell_do_lead_id,
    startDate,
    properties.WF_Clinet_Sales_Email_06,
    FollowupType.Call,
    "Test Subject",
    "Test Agenda"
  );

  await leadAPIUtils.conductFollowup(
    lead.sell_do_lead_id,
    followup.followup._id,
    properties.WF_Clinet_Sales_Email_06
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1); 

});

test("Create workflow for testing touch lead by adding offline answered call", async ({}) => {
  const utils = new Utils();
  const callingAPIUtils = new CalligAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );
  const leadAPIUtils = new LeadAPIUtils(
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06,
    properties.WF_Client_RestrictedAccess_API_06
  );
  const { noteContent } = await WorkFlowAPIUtils.setupWorkflowWithNoteAction(
    WorkflowEvent.Touched,
    properties.WF_Client_Id_06,
    properties.WF_Client_FullAccess_API_06
  );

  // Update offline call strategy to SellDoAndMobileOffline
  await callingAPIUtils.updateOfflineCallStrategy(OfflineCallStrategy.AllTypesOfCalls);

  // Create a lead
  const customerPhone = await utils.generateRandomPhoneNumber();
  const lead = await leadAPIUtils.createLeadWithDetails(
    customerPhone,
    await utils.generateRandomEmail(),
    "Touch Lead by adding offline answered call",
    "",
    "",
    "",
    properties.WF_Clinet_Sales_Id_06,
    ""
  );

   //#1 validation with >>  Create a call
   await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Outgoing,
    CallStatus.NotAnswered,
    1,
    properties.WF_Clinet_Sales_Email_06,
    false
  );

   // wait for 2 seconds
   await utils.sleep(timeConstant);

   // reterive lead details
   const leadActivityNote_Outgoing = await leadAPIUtils.getLeadActivity(
     lead.sell_do_lead_id,
     ActivityType.Note
   );
   expect(leadActivityNote_Outgoing.results.length).toBe(0);

   //#2 validation with >>  Create a call
   await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Incoming,
    CallStatus.NotAnswered,
    1,
    properties.WF_Clinet_Sales_Email_06,
    false
  );

   // wait for 2 seconds
   await utils.sleep(timeConstant);

   // reterive lead details
   const leadActivityNote_Incoming = await leadAPIUtils.getLeadActivity(
     lead.sell_do_lead_id,
     ActivityType.Note
   );
   expect(leadActivityNote_Incoming.results.length).toBe(0);

  //#3 validation with >>  schedule site visit
  const startDate = await utils.calculateFutureDate(AheadOf.Minute, 10, "yyyy-MM-dd HH:mm") + " IST";
  const endDate = await utils.calculateFutureDate(AheadOf.Minute, 20, "yyyy-MM-dd HH:mm") + " IST";
  const siteVisit = await leadAPIUtils.scheduleSiteVisit(
    lead.sell_do_lead_id,
    startDate,
    endDate,
    properties.WF_Clinet_Sales_Email_06,
    properties.WF_Clinet_Project_Id_06_01,
    false
  );

  // conduct site visit
  await leadAPIUtils.updateSiteVisitStatus(
    siteVisit.site_visit._id,
    lead.sell_do_lead_id,
    properties.WF_Clinet_Sales_Email_06,
    SiteVisitAction.Conducted
  );

   // wait for 2 seconds
   await utils.sleep(timeConstant);

   // reterive lead details
   const leadActivityNote_SiteVisit = await leadAPIUtils.getLeadActivity(
     lead.sell_do_lead_id,
     ActivityType.Note
   );
   expect(leadActivityNote_SiteVisit.results.length).toBe(0);

  //#4 validation with >>  schedule followup
  const followup = await leadAPIUtils.scheduleFollowup(
    lead.sell_do_lead_id,
    startDate,
    properties.WF_Clinet_Sales_Email_06,
    FollowupType.Call,
    "Test Subject",
    "Test Agenda"
  );

  //conduct followup
  await leadAPIUtils.conductFollowup(
    lead.sell_do_lead_id,
    followup.followup._id,
    properties.WF_Clinet_Sales_Email_06
  );

   // wait for 2 seconds
   await utils.sleep(timeConstant);

   // reterive lead details
   const leadActivityNote_Followup = await leadAPIUtils.getLeadActivity(
     lead.sell_do_lead_id,
     ActivityType.Note
   );
   expect(leadActivityNote_Followup.results.length).toBe(0);

  //#5 validation with >>  Create a call
  await callingAPIUtils.AddOfflineCall(
    lead.sell_do_lead_id,
    CallDirection.Outgoing,
    CallStatus.Answered,
    1,
    properties.WF_Clinet_Sales_Email_06,
    false
  );

  // wait for 2 seconds
  await utils.sleep(timeConstant);

  // reterive lead details
  const leadActivityNote = await leadAPIUtils.getLeadActivity(
    lead.sell_do_lead_id,
    ActivityType.Note
  );
  expect(leadActivityNote.results.length).toBeGreaterThan(0);
  expect(leadActivityNote.results[0].note.content).toBe(noteContent);
  expect(leadActivityNote.results.length).toBe(1);

});
