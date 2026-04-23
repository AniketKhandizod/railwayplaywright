import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { ActivityType, LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';
import { sendEmailForm } from '../../pages/UserPages/Forms/EmailForm.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';

test.describe.configure({ mode: "parallel"});
test('Validate send email to lead', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const utils = new Utils();
    const leadPage = new LeadProfilePage(page);
    const emailForm = new sendEmailForm(page);
    const notyMessage = new NotyMessage(page);

    const emailSubject = "Test Email "+ await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const emailBody = "Test Email Body "+ await utils.generateRandomString(50,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const emailTo = await utils.generateRandomEmail();

    await loginPage.login(properties.Sales_email, properties.PASSWORD);

    const leadsName ="Send email to lead test "+ await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});

    // Create Leads for Incoming, Outgoing and All Calls
    let LeadId = (await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), emailTo,leadsName,"","","",properties.Sales_id,"")).sell_do_lead_id;

    await globalSearchPage.globalSearch("#"+LeadId);

    // Click on send email button
    await leadPage.clickOnEmailActionButton();

    await emailForm.clickOnComposeEmailButton();

    await emailForm.selectEmailType("General email");

    await emailForm.enterEmailSubject(emailSubject);

    await emailForm.enterEmailBody(emailBody);

    await emailForm.clickOnSendEmailFormButton();

    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toBe("Email sent successfully");

    // validate email
    const email = await leadAPIUtils.getLeadActivity(LeadId, ActivityType.Email);
    expect(email.results[0].email.direction).toContain("outgoing");
    expect(email.results[0].email.subject).toBe(emailSubject);
    expect(email.results[0].email.unread).toBe(true);

});

test('Validate send email to lead with template', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const utils = new Utils();
    const leadPage = new LeadProfilePage(page);
    const emailForm = new sendEmailForm(page);
    const notyMessage = new NotyMessage(page);

    const emailTo = await utils.generateRandomEmail();

    await loginPage.login(properties.Sales_email, properties.PASSWORD);

    const leadsName ="Send email to lead test "+ await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});

    // Create Leads for Incoming, Outgoing and All Calls
    let LeadId = (await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), emailTo,leadsName,"","",properties.Project_id,properties.Sales_id,"")).sell_do_lead_id;

    await globalSearchPage.globalSearch("#"+LeadId);

    await leadPage.clickOnEmailActionButton();

    await emailForm.clickOnComposeEmailButton();

    await emailForm.selectEmailType("General email");

    await emailForm.selectTemplate(properties.Email_Template_Name);

    await emailForm.clickOnSendEmailFormButton();

    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toBe("Email sent successfully");

     // validate email
     const email = await leadAPIUtils.getLeadActivity(LeadId, ActivityType.Email);
     expect(email.results[0].email.direction).toContain("outgoing");
     expect(email.results[0].email.subject).toContain(properties.Email_Template_Subject+" "+properties.Project_Name);
     expect(email.results[0].email.unread).toBe(true);
});