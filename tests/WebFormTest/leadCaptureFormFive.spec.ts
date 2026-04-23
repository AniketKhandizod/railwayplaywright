import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AutomationPage } from "../../pages/AdminAndSupportPages/AutomationPage.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { GlobalSearchPage } from "../../pages/AdminAndSupportPages/GlobalSearchPage.ts";
import { Configuration, LeadCaptureFormPage } from "../../pages/AdminAndSupportPages/WebFormPages/LeadCaptureFormPage.ts";
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';

test('Create new lead capture and validate mandatory fields warning message with custom project mandatory', async ({ page }) => {

  const utils = new Utils();
  const sidePanal = new SidePanal(page);
  const automationPage = new AutomationPage(page);
  const loginPage = new LoginPage(page);
  const leadCaptureFormPage = new LeadCaptureFormPage(page);
  await utils.startErrorTracking(page);

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

  // Add new field for project
  expect(await leadCaptureFormPage.addNewField(true)).toBe("Alignment for fields updated successfully.");

  
  // Preview
  await leadCaptureFormPage.preview("", "", "");
 // await leadCaptureFormPage.selectProject(properties.Project_Name);

  // Validate mandatory fields warning message
  const errorFieldsCount = await leadCaptureFormPage.getErrorFieldsCount();
  await utils.validateBrowserAndApiErrors();
});

test('Create new lead capture and validate preview page details', async ({ page }) => {

  const utils = new Utils();
  const sidePanal = new SidePanal(page);
  const automationPage = new AutomationPage(page);
  const loginPage = new LoginPage(page);
  const globalSearchPage = new GlobalSearchPage(page);
  const leadCaptureFormPage = new LeadCaptureFormPage(page);
  const leadPage = new LeadProfilePage(page);
  await utils.startErrorTracking(page);

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

  // Add new field for project
  expect(await leadCaptureFormPage.addNewField(false)).toBe("Alignment for fields updated successfully.");

  
  // Preview
  await leadCaptureFormPage.preview("", "", "", false);

  expect(await leadCaptureFormPage.getPreviewPageTitle()).toBe(formName);
  expect(await leadCaptureFormPage.getGreetingText()).toBe(formGreeting);
  expect(await leadCaptureFormPage.getSubmitButtonText()).toBe(formSubmitButton);
  expect(await leadCaptureFormPage.getDisclaimerText()).toBe("Disclaimer: "+formDisclaimer);
  
  await leadCaptureFormPage.preview(leadName, leadEmail,"+91 " + leadPhone, true);
  expect(await leadCaptureFormPage.getThankyouMsgText()).toBe(formThankyou);
  expect(await leadCaptureFormPage.getDisclaimerText()).toBe("Disclaimer: "+formDisclaimer);

  await utils.validateBrowserAndApiErrors();
});