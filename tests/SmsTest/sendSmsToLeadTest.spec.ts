import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { ActivityType, LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';
import { sendSMSForm } from '../../pages/UserPages/Forms/SmsForm.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';

test.describe.configure({ mode: "parallel"});
test('Validate send sms to lead', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const utils = new Utils();
    const leadPage = new LeadProfilePage(page);
    const smsForm = new sendSMSForm(page);
    const notyMessage = new NotyMessage(page);

    await loginPage.login(properties.Sales_email, properties.PASSWORD);

    const leadsName ="Send sms to lead test "+ await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});

    let LeadId = (await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), "",leadsName,"","","",properties.Sales_id,"")).sell_do_lead_id;

    await globalSearchPage.globalSearch("#"+LeadId);

    // Click on send sms button
    await leadPage.clickOnSMSActionButton();

    await smsForm.clickOnSmsTemplate();

    await smsForm.selectSmsTemplate(properties.SMS_Template_Name);

    await smsForm.clickOnSendSMSButton();

    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toBe("SMS sent successfully");

    // validate sms
    const sms = await leadAPIUtils.getLeadActivity(LeadId, ActivityType.Sms);
    expect(sms.results[0].sms.sms_type).toBe(properties.SMS_Template_Type.toLowerCase());
    expect(sms.results[0].sms.content).toContain(properties.SMS_Template_Content);

});
