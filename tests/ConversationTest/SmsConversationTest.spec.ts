import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { ConversationSmsDirection, SmsConversationPage } from '../../pages/UserPages/ConversationPages/SmsConversationPage.ts';

test.describe.configure({ mode: "parallel"});
test('Validate sms conversation', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidePanal = new SidePanal(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const utils = new Utils();
    const smsConversationPage = new SmsConversationPage(page);
    const leadsName ="Sms conversation test "+ await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
   

    await loginPage.login(properties.Convsms_email_sales, properties.PASSWORD);
    await sidePanal.clickOnSMSConversation();

    let leadForSms = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), "",leadsName,"","","",properties.Convsms_id_sales,"");
    await leadAPIUtils.sendSmsToLead(leadForSms.sell_do_lead_id, properties.Convsms_email_sales);
    
    await smsConversationPage.selectDirection(ConversationSmsDirection.Outgoing);
    expect(await smsConversationPage.getLeadIdList()).toContain(leadForSms.sell_do_lead_id);
    expect(await smsConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await smsConversationPage.getSmsContentList()).toContain(properties.SMS_Template_Content);
    expect(await smsConversationPage.getSmsTypeList()).toContain(properties.SMS_Template_Type);
    expect(await smsConversationPage.getSmsActivityOwnerList()).toContain(properties.Convsms_Name_sales);
    expect(await smsConversationPage.getSmsActivityDateList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));

});
