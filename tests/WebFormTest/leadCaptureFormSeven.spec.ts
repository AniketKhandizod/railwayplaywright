import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AutomationPage } from "../../pages/AdminAndSupportPages/AutomationPage.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { Configuration, LeadCaptureFormPage } from "../../pages/AdminAndSupportPages/WebFormPages/LeadCaptureFormPage.ts";
import { ActivityType, LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';

test('Create new lead capture and validate reengage feed', async ({ page }) => {

  const utils = new Utils();
  const sidePanal = new SidePanal(page);
  const automationPage = new AutomationPage(page);
  const loginPage = new LoginPage(page);
  const leadCaptureFormPage = new LeadCaptureFormPage(page);
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Random form details
  const formName = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const formGreeting = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const formThankyou = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const formSubmitButton = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const formDisclaimer = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  
  // Random lead details
  const leadName = await utils.generateRandomString(10, {casing: "lower", includeNumbers: false, includeSpecialChars: false});
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const createdLeadId = await leadAPIUtils.createLeadWithDetails(leadPhone, leadEmail, leadName,"","","","",properties.srd1);
  
  // Login
  await loginPage.login(properties.Admin_email, properties.PASSWORD);

  // Navigate to Automation Page
  await sidePanal.clickOnAutomation();

  // Navigate to Lead Capture Forms
  await automationPage.clickOnLeadCaptureForms();

  // Create new lead capture form
  await leadCaptureFormPage.clickOnNewLeadCaptureForm();
  await leadCaptureFormPage.createNewLeadCaptureForm(formName, formGreeting, formThankyou, formSubmitButton, formDisclaimer);

  // Configure form
  await leadCaptureFormPage.configureCaptureForm(Configuration.EnableCaptcha, false);
  await leadCaptureFormPage.configureCaptureForm(Configuration.PhoneVerification, false);
  await leadCaptureFormPage.configureCaptureForm(Configuration.Selfhosting, false);
  expect(await leadCaptureFormPage.configureCaptureForm(Configuration.CalendarSlotsForSiteisit, false, true)).toBe("Form created successfully.");

  // Form fields mapping
  await leadCaptureFormPage.fieldsMapping();

  // Preview
  await leadCaptureFormPage.previewWithSRDUpdate(leadName, leadEmail,"+91 " + leadPhone, page, properties.srd2, true);

  // Verify lead campaign, name and total campaigns on lead
  const leadDetails = await leadAPIUtils.leadRetrieve(leadEmail) as any;
  const leadNameFromApi = leadDetails?.lead?.name;
  const totalCampaignsOnLead = leadDetails?.lead?.campaigns;

  expect(leadNameFromApi).toBe(leadName.toLowerCase());
  expect(totalCampaignsOnLead.length).toBe(2);
  expect(totalCampaignsOnLead[0].name).toBe(properties.srd1_name.toLowerCase());
  expect(totalCampaignsOnLead[1].name).toBe(properties.srd2_name.toLowerCase());

  // Verify reengage feed
  const leadActivity = await leadAPIUtils.getLeadActivity(createdLeadId.sell_do_lead_id, ActivityType.Feed);
  const getReengageFeed = leadActivity?.results[0]?.feed?.content;
  expect(getReengageFeed).toBe(`Lead Re-engaged via ${properties.srd2_name.toLowerCase()}`);
});