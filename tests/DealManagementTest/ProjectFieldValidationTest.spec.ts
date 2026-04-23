import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from '../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts';
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { FeaturesPage } from '../../pages/AdminAndSupportPages/FeaturesPage.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { addNoteForm } from '../../pages/UserPages/Forms/NoteForm.ts';
import { triggerCallForm } from '../../pages/UserPages/Forms/CallForm.ts';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';
import { sendEmailForm } from '../../pages/UserPages/Forms/EmailForm.ts';
import { sendSMSForm } from '../../pages/UserPages/Forms/SMSForm.ts';
import { sendWhatsAppForm } from '../../pages/UserPages/Forms/WhatsAppForm.ts';
import { addFollowUpForm } from '../../pages/UserPages/Forms/FollowupForm.ts';
import { addOfflineCallForm } from '../../pages/UserPages/Forms/OfflineCallForm.ts';
import { DatePicker } from '../../pages/UserPages/DatePicker.ts';

test.describe.configure({ mode: "serial"});
test('Enable Deal Management', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const featuresPage = new FeaturesPage(page);
    const notyMessage = new NotyMessage(page);
    const sidePanal = new SidePanal(page);
    
    await loginPage.loginWithClientId(properties.SM_00, properties.PASSWORD, properties.Client_id);
   
    await sidePanal.clickOnSettings();
   
    await settingPage.clickOnEnableFeatures();
   
    await featuresPage.clickOnDealManagement(true);
    await featuresPage.clickOnSave();
    expect(await notyMessage.getNotyMessage(true)).toBe("Features Configuration updated successfully");

});

test('Validate Project Field On Every Action after enabling deal management', async ({ page }) => {
   
    const flag = true;
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const addNote = new addNoteForm(page);
    const addCall = new triggerCallForm(page);
    const leadPage = new LeadProfilePage(page);
    const addEmail = new sendEmailForm(page);
    const addSMS = new sendSMSForm(page);
    const addWhatsApp = new sendWhatsAppForm(page);
    const addFollowUp = new addFollowUpForm(page);
    const addOfflineCall = new addOfflineCallForm(page);

    await loginPage.login(properties.Sales_email,properties.PASSWORD);

    const lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Deal Management Test","","",properties.Project_id,properties.Sales_id,"");

    await globalSearchPage.globalSearch("#"+lead.sell_do_lead_id);

    expect(await addNote.isProjectDropdownVisible()).toBe(flag);

    // Call
    await leadPage.clickOnCallActionButton();
    await addCall.waitTillPlaceCallButtonVisible();
    expect(await addCall.isCallProjectButtonVisible()).toBe(flag);
    await addCall.clickOnCloseButton();

    // Email
    await leadPage.clickOnEmailActionButton();
    await addEmail.clickOnComposeEmailButton();
    expect(await addEmail.isProjectDropdownVisible()).toBe(flag);
    await addEmail.clickOnCloseEmailFormButton();

    // SMS
    await leadPage.clickOnSMSActionButton();
    await addSMS.waitTillCloseButtonVisible();
    expect(await addSMS.isProjectDropdownVisible()).toBe(flag);
    await addSMS.clickOnCloseButton();

    // WhatsApp
    await leadPage.clickOnWhatsAppActionButton();
    await addWhatsApp.clickOnSendWhatsAppMessageButton();
    await addWhatsApp.waitTillSelectWhatsAppAccountButtonVisible();
    expect(await addWhatsApp.isProjectDropdownVisible()).toBe(flag);
    await addWhatsApp.clickOnCloseButton();

    // Follow Up
    await leadPage.clickOnFollowUpActionButton();
    await addFollowUp.waitUntilScheduleFollowUpButtonVisible();
    expect(await addFollowUp.isProjectDropdownVisible()).toBe(flag);
    await addFollowUp.clickOnCloseButton();

    // Offline call
    await leadPage.clickOnMoreButton();
    await leadPage.clickOnOfflineCallActionButton();
    await addOfflineCall.waitUntilSaveOfflineCallButtonVisible();
    expect(await addOfflineCall.isProjectDropdownVisible()).toBe(flag);
    await addOfflineCall.clickOnCloseButton();

});

test('Disable Deal Management', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const featuresPage = new FeaturesPage(page);
    const notyMessage = new NotyMessage(page);
    const sidePanal = new SidePanal(page);

    await loginPage.loginWithClientId(properties.SM_00, properties.PASSWORD, properties.Client_id);
   
    await sidePanal.clickOnSettings();
   
    await settingPage.clickOnEnableFeatures();
   
    await featuresPage.clickOnDealManagement(false);
    await featuresPage.clickOnSave();
    expect(await notyMessage.getNotyMessage(true)).toBe("Features Configuration updated successfully");

});

test('Validate schedule follow up when deal management is disabled', async ({ page }) => {

    const followUpType = "Call";
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const addFollowUp = new addFollowUpForm(page);
    const notyMessage = new NotyMessage(page);
    const datePicker = new DatePicker(page);

    await loginPage.login(properties.Sales_email,properties.PASSWORD);

    const lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Deal Management Test","","",properties.Project_id,properties.Sales_id,"");

    await globalSearchPage.globalSearch("#"+lead.sell_do_lead_id);

     // Follow Up
     await leadPage.clickOnFollowUpActionButton();

     await addFollowUp.clickOnScheduleFollowUpDateButton();

     await datePicker.selectDate(await utils.calculateFutureDate(AheadOf.Day, 1, 'DD'));

     await addFollowUp.clickOnScheduleFollowUpTimeButton();

     await datePicker.selectTime(await utils.calculateFutureDate(AheadOf.Hour, 3, 'h mm a'));

     await addFollowUp.selectFollowUpType(followUpType);
     
     //await addFollowUp.selectFollowUpProject(properties.Project_Name);
     await addFollowUp.fillSubject("Test Subject");
     await addFollowUp.fillAgenda("Test Agenda");
     await addFollowUp.clickOnScheduleFollowUpButton(utils);
     
     expect(await notyMessage.getNotyMessage(false)).toBe(`Followup ${followUpType.toLowerCase()} scheduled successfully`);
     
     await leadPage.clickOnFollowUpTab();

     const activityList = await (await leadPage.getActivityList()).first().textContent();
     const activityListWithoutSpaces = activityList?.replace(/\s+/g, ' ') || ' ';
//     const expectedString =` A followup ${followUpType.toLowerCase()} is scheduled by ${properties.Sales_name} . on ${utils.calculateFutureDate(AheadOf.Day, 1, 'dd/MM/yyyy')}, ${utils.calculateFutureDate(AheadOf.Hour, 3, 'h')}:00 ${utils.calculateFutureDate(AheadOf.Hour, 3, 'a')}`;
     const expectedString =` A followup ${followUpType.toLowerCase()} is scheduled by ${properties.Sales_name} . on ${await utils.calculateFutureDate(AheadOf.Day, 1, 'dd/MM/yyyy')}`;

     expect(activityListWithoutSpaces).toContain(expectedString);
     expect(activityListWithoutSpaces).toContain(`| ${properties.Sales_name} . Scheduled`);
});

test('Validate Project Field On Every Action after disabling deal management', async ({ page }) => {
   
    const flag = false;
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const addNote = new addNoteForm(page);
    const addCall = new triggerCallForm(page);
    const leadPage = new LeadProfilePage(page);
    const addEmail = new sendEmailForm(page);
    const addSMS = new sendSMSForm(page);
    const addWhatsApp = new sendWhatsAppForm(page);
    const addFollowUp = new addFollowUpForm(page);
    const addOfflineCall = new addOfflineCallForm(page);
    const notyMessage = new NotyMessage(page);

    await loginPage.login(properties.Sales_email,properties.PASSWORD);

    const lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Deal Management Test","","",properties.Project_id,properties.Sales_id,"");

    await globalSearchPage.globalSearch("#"+lead.sell_do_lead_id);

    expect(await addNote.isProjectDropdownVisible()).toBe(false);

    // Call
    await leadPage.clickOnCallActionButton();
    await addCall.clickOnPhoneNumber();
    expect(await notyMessage.getNotyMessage(false)).toBe("Please wait while we connect your call.");
    await notyMessage.clickOnCloseBottomLeftPopup();

    // Email
    await leadPage.clickOnEmailActionButton();
    await addEmail.clickOnComposeEmailButton();
    expect(await addEmail.isProjectDropdownVisible()).toBe(flag);
    await addEmail.clickOnCloseEmailFormButton();

    // SMS
    await leadPage.clickOnSMSActionButton();
    await addSMS.waitTillCloseButtonVisible();
    expect(await addSMS.isProjectDropdownVisible()).toBe(flag);
    await addSMS.clickOnCloseButton();

    // WhatsApp
    await leadPage.clickOnWhatsAppActionButton();
    await addWhatsApp.clickOnSendWhatsAppMessageButton();
    await addWhatsApp.waitTillSelectWhatsAppAccountButtonVisible();
    expect(await addWhatsApp.isProjectDropdownVisible()).toBe(flag);
    await addWhatsApp.clickOnCloseButton();

    // Follow Up
    await leadPage.clickOnFollowUpActionButton();
    await addFollowUp.waitUntilScheduleFollowUpButtonVisible();
    expect(await addFollowUp.isProjectDropdownVisible()).toBe(flag);
    await addFollowUp.clickOnCloseButton();

    // Offline call
    await leadPage.clickOnMoreButton();
    await leadPage.clickOnOfflineCallActionButton();
    await addOfflineCall.waitUntilSaveOfflineCallButtonVisible();
    expect(await addOfflineCall.isProjectDropdownVisible()).toBe(flag);
    await addOfflineCall.clickOnCloseButton();

});

test('Enable Deal Management for testing schedule follow up and offline call', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const featuresPage = new FeaturesPage(page);
    const notyMessage = new NotyMessage(page);
    const sidePanal = new SidePanal(page);

    await loginPage.loginWithClientId(properties.SM_00, properties.PASSWORD, properties.Client_id);
   
    await sidePanal.clickOnSettings();
   
    await settingPage.clickOnEnableFeatures();
   
    await featuresPage.clickOnDealManagement(true);
    await featuresPage.clickOnSave();
    expect(await notyMessage.getNotyMessage(true)).toBe("Features Configuration updated successfully");

});

test('Validate schedule follow up when deal management is enabled', async ({ page }) => {

    const flag = true;
    const followUpType = "Call";
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const addFollowUp = new addFollowUpForm(page);
    const notyMessage = new NotyMessage(page);
    const datePicker = new DatePicker(page);

    await loginPage.login(properties.Sales_email,properties.PASSWORD);

    const lead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Deal Management Test","","",properties.Project_id,properties.Sales_id,"");

    await globalSearchPage.globalSearch("#"+lead.sell_do_lead_id);

     // Follow Up
     await leadPage.clickOnFollowUpActionButton();

     await addFollowUp.clickOnScheduleFollowUpDateButton();

     await datePicker.selectDate(await utils.calculateFutureDate(AheadOf.Day, 1, 'DD'));

     await addFollowUp.clickOnScheduleFollowUpTimeButton();

     await datePicker.selectTime(await utils.calculateFutureDate(AheadOf.Hour, 3, 'h mm a'));

     await addFollowUp.selectFollowUpType(followUpType);
     await addFollowUp.selectFollowUpProject(properties.Project_Name);
     await addFollowUp.fillSubject("Test Subject");
     await addFollowUp.fillAgenda("Test Agenda");
     await addFollowUp.clickOnScheduleFollowUpButton(utils);
     expect(await notyMessage.getNotyMessage(false)).toBe(`Followup ${followUpType.toLowerCase()} scheduled successfully`);
     await leadPage.clickOnFollowUpTab();

     const activityList = await (await leadPage.getActivityList()).first().textContent();
     const activityListWithoutSpaces = activityList?.replace(/\s+/g, ' ') || ' ';
     //const expectedString =` A followup ${followUpType.toLowerCase()} is scheduled by ${properties.Sales_name} . on ${utils.calculateFutureDate(AheadOf.Day, 1, 'dd/MM/yyyy')}, ${utils.calculateFutureDate(AheadOf.Hour, 3, 'h')}:00 ${utils.calculateFutureDate(AheadOf.Hour, 3, 'a')}`;
     const expectedString =` A followup ${followUpType.toLowerCase()} is scheduled by ${properties.Sales_name} . on ${await utils.calculateFutureDate(AheadOf.Day, 1, 'dd/MM/yyyy')}`;
     expect(activityListWithoutSpaces).toContain(expectedString);
     expect(activityListWithoutSpaces.includes(`| ${properties.Sales_name} . | ${properties.Project_Name} Scheduled`)).toBe(flag);
});