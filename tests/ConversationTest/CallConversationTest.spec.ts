import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { CallDirection, CalligAPIUtils, CallStatus } from '../../utils/APIUtils/CallingAPIUtils.ts';
import { CallConversationPage, ConversationCallDirection } from '../../pages/UserPages/ConversationPages/CallConversationPage.ts';

test.describe.configure({ mode: "parallel"});
test('Validate call conversation', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidePanal = new SidePanal(page);
    const calligAPIUtils = new CalligAPIUtils(properties.Client_id, properties.FullAccess_API);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const utils = new Utils();
    const callConversationPage = new CallConversationPage(page);
    const leadsName ="Call conversation test "+ (await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false}));

    await loginPage.login(properties.Convecall_email_pre_sales, properties.PASSWORD);
    await sidePanal.clickOnCallConversation();

    // Create Leads for Incoming, Outgoing and All Calls
    let AllCallLead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadsName,"","","",properties.Convecall_id_pre_sales,"");
    await calligAPIUtils.AddOfflineCall(AllCallLead.sell_do_lead_id,CallDirection.Outgoing,CallStatus.NotAnswered,1,properties.Convecall_email_pre_sales,false);
    await callConversationPage.selectDirection(ConversationCallDirection.All);
    await page.reload();
    expect(await callConversationPage.getLeadIdList()).toContain(AllCallLead.sell_do_lead_id);
    expect(await callConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await callConversationPage.getCallStatusList()).toContain("Not Answered");
    expect(await callConversationPage.getCallActivityOwnerList()).toContain(properties.Convecall_Name_pre_sales);
    expect(await callConversationPage.getLeadOwnerList()).toContain(properties.Convecall_Name_pre_sales);
    expect(await callConversationPage.getCallActivityDateList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));
    expect(await callConversationPage.getCallDurationList()).toContain("00:00:01");

    // Create Leads for Outgoing Calls
    let OutgoingCallLead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadsName,"","","",properties.Convecall_id_pre_sales,"");
    await calligAPIUtils.AddOfflineCall(OutgoingCallLead.sell_do_lead_id,CallDirection.Outgoing,CallStatus.Answered,1,properties.Convecall_email_pre_sales,false);
    await callConversationPage.selectDirection(ConversationCallDirection.Outbound);
    await page.reload();
    expect(await callConversationPage.getLeadIdList()).toContain(OutgoingCallLead.sell_do_lead_id);
    expect(await callConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await callConversationPage.getCallStatusList()).toContain("Answered");
    expect(await callConversationPage.getCallActivityOwnerList()).toContain(properties.Convecall_Name_pre_sales);
    expect(await callConversationPage.getLeadOwnerList()).toContain(properties.Convecall_Name_pre_sales);
    expect(await callConversationPage.getCallActivityDateList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));
    expect(await callConversationPage.getCallDurationList()).toContain("00:00:01");

    // Create Leads for Incoming Calls
    let IncomingCallLead = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),leadsName,"","","",properties.Convecall_id_pre_sales,"");
    await calligAPIUtils.AddOfflineCall(IncomingCallLead.sell_do_lead_id,CallDirection.Incoming,CallStatus.Answered,1,properties.Convecall_email_pre_sales,false);
    await callConversationPage.selectDirection(ConversationCallDirection.Inbound);
    await page.reload();
    expect(await callConversationPage.getLeadIdList()).toContain(IncomingCallLead.sell_do_lead_id);
    expect(await callConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await callConversationPage.getCallStatusList()).toContain("Answered");
    expect(await callConversationPage.getCallActivityOwnerList()).toContain(properties.Convecall_Name_pre_sales);
    expect(await callConversationPage.getLeadOwnerList()).toContain(properties.Convecall_Name_pre_sales);
    expect(await callConversationPage.getCallActivityDateList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));
    expect(await callConversationPage.getCallDurationList()).toContain("00:00:01");

});