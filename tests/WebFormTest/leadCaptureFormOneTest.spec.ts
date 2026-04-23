import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AutomationPage } from "../../pages/AdminAndSupportPages/AutomationPage.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { Configuration, LeadCaptureFormPage } from "../../pages/AdminAndSupportPages/WebFormPages/LeadCaptureFormPage.ts";

test('Create new lead capture form and verify how to integrate', async ({ page }) => {

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

  // Add new field
  expect(await leadCaptureFormPage.addNewField()).toBe("Alignment for fields updated successfully.");

  // How to integrate
  const howToIntegrateUrl = await leadCaptureFormPage.howToIntegrate(page);
  const formId = howToIntegrateUrl[1].split('/')[5];
  const scriptCode = howToIntegrateUrl[0];
  const expectedScriptCode = `<script src='${new URL(page.url()).origin}//t/forms/${properties.Client_id}/${formId}.js' data-form-id='${formId}'></script>`;
  expect(scriptCode).toBe(expectedScriptCode);
});