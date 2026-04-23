import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AutomationPage } from "../../pages/AdminAndSupportPages/AutomationPage.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { Configuration, LeadCaptureFormPage } from "../../pages/AdminAndSupportPages/WebFormPages/LeadCaptureFormPage.ts";
import { LeadCaptureFormListingPage } from '../../pages/AdminAndSupportPages/WebFormPages/LeadCaptureFormListingPage.ts';

test('Create new lead capture and validate mandatory fields warning message with custom project mandatory', async ({ page }) => {

  const utils = new Utils();
  const sidePanal = new SidePanal(page);
  const automationPage = new AutomationPage(page);
  const loginPage = new LoginPage(page);
  const leadCaptureFormPage = new LeadCaptureFormPage(page);

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
  expect(errorFieldsCount).toBe(4);
});

test('Create new lead capture and validate listing page', async ({ page }) => {

  const utils = new Utils();
  const sidePanal = new SidePanal(page);
  const automationPage = new AutomationPage(page);
  const loginPage = new LoginPage(page);
  const leadCaptureFormPage = new LeadCaptureFormPage(page);
  const leadCaptureFormListingPage = new LeadCaptureFormListingPage(page);

  // Random form details
  const formName = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const formGreeting = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const formThankyou = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const formSubmitButton = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  const formDisclaimer = await utils.generateRandomString(10, {casing: "lower", includeNumbers: true, includeSpecialChars: false});
  
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

  // Lead capture form listing
  await leadCaptureFormListingPage.navigateToLeadCaptureFormListing();
  const listingResult = await leadCaptureFormListingPage.searchLeadCaptureForm(formName);
  expect((await listingResult.nth(0).textContent())?.trim().toLowerCase()).toBe(formName.toLowerCase());
  expect((await listingResult.nth(1).textContent())?.trim().toLowerCase()).toBe("4 fields".toLowerCase());
  expect((await listingResult.nth(2).textContent())?.trim().toLowerCase()).toBe("active".toLowerCase());
});