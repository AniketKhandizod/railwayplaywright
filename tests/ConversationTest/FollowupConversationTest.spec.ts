import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils,FollowupType } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { FollowupConversationPage } from '../../pages/UserPages/ConversationPages/FollowupConversationPage.ts';
import { ConversationFollowupDirection } from '../../pages/UserPages/ConversationPages/FollowupConversationPage.ts';

test.describe.configure({ mode: "parallel"});
test('Validate followup conversation', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidePanal = new SidePanal(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const utils = new Utils();
    const followupConversationPage = new FollowupConversationPage(page);
    const leadsName ="Followup conversation test "+ await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const startDate = await utils.calculateFutureDate(AheadOf.Minute,10,"yyyy-MM-dd HH:mm")+" IST"; 

    await loginPage.login(properties.Convebulkc2c_email_manager, properties.PASSWORD);
    await sidePanal.clickOnFollowupConversation();
    
    let leadForFollowup = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), "",leadsName,"","","",properties.Convefollowup_id_sales,"");
  
    const output =await leadAPIUtils.scheduleFollowup(leadForFollowup.sell_do_lead_id, startDate, properties.Convefollowup_email_sales, FollowupType.Call, "scheduled", "Test Subject");
    
    // Extract the followup _id
    const followupId = output.followup._id;
    await followupConversationPage.selectDirection(ConversationFollowupDirection.Scheduled);
    await followupConversationPage.selectTodaysDate();
    
    expect(await followupConversationPage.getLeadIdList()).toContain(leadForFollowup.sell_do_lead_id);
    expect(await followupConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await followupConversationPage.getFollowupTypeList()).toContain("Call");
    expect(await followupConversationPage.getFollowupStatusList()).toContain("Scheduled");
    expect(await followupConversationPage.getFollowupActivityOwnerList()).toContain(properties.Convefollowup_Name_sales);
    expect(await followupConversationPage.getFollowupScheduleOnList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));
    expect(await followupConversationPage.getFollowupConductedOnList()).toContain("-");

    await leadAPIUtils.conductFollowup(leadForFollowup.sell_do_lead_id, followupId, properties.Convefollowup_email_sales);

    await followupConversationPage.selectDirection(ConversationFollowupDirection.Conducted);
    await followupConversationPage.selectTodaysDate();
    
    expect(await followupConversationPage.getLeadIdList()).toContain(leadForFollowup.sell_do_lead_id);
    expect(await followupConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await followupConversationPage.getFollowupTypeList()).toContain("Call");
    expect(await followupConversationPage.getFollowupStatusList()).toContain("Conducted");
    expect(await followupConversationPage.getFollowupActivityOwnerList()).toContain(properties.Convefollowup_Name_sales);
    expect(await followupConversationPage.getFollowupScheduleOnList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));
    expect(await followupConversationPage.getFollowupConductedOnList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));
});