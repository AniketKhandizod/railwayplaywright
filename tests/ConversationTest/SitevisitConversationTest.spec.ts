import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { ConversationSitevisitDirection, SitevisitConversationPage } from '../../pages/UserPages/ConversationPages/SitevisitConversationPage.ts';

test.describe.configure({ mode: "parallel"});
test('Validate sitevisit conversation', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const sidePanal = new SidePanal(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const utils = new Utils();
    const sitevisitConversationPage = new SitevisitConversationPage(page);
    const leadsName ="Sitevisit conversation test "+ await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
    const startDate =await utils.calculateFutureDate(AheadOf.Minute,15,"yyyy-MM-dd HH:mm")+" IST"; 
    const endDate =await utils.calculateFutureDate(AheadOf.Minute,45,"yyyy-MM-dd HH:mm")+" IST"; 

    await loginPage.login(properties.Convesitevisit_email_pre_sales, properties.PASSWORD);
    await sidePanal.clickOnSiteVisitConversation();
    
    let leadForSitevisit = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), "",leadsName,"","","",properties.Convesitevisit_id_pre_sales,"");
  
    await leadAPIUtils.scheduleSiteVisit(leadForSitevisit.sell_do_lead_id, startDate, endDate, properties.Convesitevisit_email_pre_sales, properties.Project_id,false);
    await sitevisitConversationPage.selectDirection(ConversationSitevisitDirection.Scheduled);
    await sitevisitConversationPage.selectTodaysDate();
    expect(await sitevisitConversationPage.getLeadIdList()).toContain(leadForSitevisit.sell_do_lead_id);
    expect(await sitevisitConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await sitevisitConversationPage.getProjectList()).toContain(properties.Project_Name);
    expect(await sitevisitConversationPage.getInitiatedByList()).toContain(properties.Convesitevisit_Name_pre_sales);
    expect(await sitevisitConversationPage.getStatusList()).toContain("Scheduled");
    expect(await sitevisitConversationPage.getActivityOwnerList()).toContain(properties.Convesitevisit_Name_pre_sales);
    expect(await sitevisitConversationPage.getActivityScheduleOnList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));
    expect(await sitevisitConversationPage.getConductedOnList()).toContain("-");

    leadForSitevisit = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), "",leadsName,"","","",properties.Convesitevisit_id_pre_sales,"");
    await leadAPIUtils.scheduleSiteVisit(leadForSitevisit.sell_do_lead_id, startDate, endDate, properties.Convesitevisit_email_pre_sales, properties.Project_id,true);
    await sitevisitConversationPage.selectDirection(ConversationSitevisitDirection.Conducted);
    await sitevisitConversationPage.selectTodaysDate();
    expect(await sitevisitConversationPage.getLeadIdList()).toContain(leadForSitevisit.sell_do_lead_id);
    expect(await sitevisitConversationPage.getLeadNameList()).toContain(leadsName);
    expect(await sitevisitConversationPage.getProjectList()).toContain(properties.Project_Name);
    expect(await sitevisitConversationPage.getInitiatedByList()).toContain(properties.Convesitevisit_Name_pre_sales);
    expect(await sitevisitConversationPage.getStatusList()).toContain("Conducted");
    expect(await sitevisitConversationPage.getActivityOwnerList()).toContain(properties.Convesitevisit_Name_pre_sales);
    expect(await sitevisitConversationPage.getActivityScheduleOnList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));
    expect(await sitevisitConversationPage.getConductedOnList()).toContain(await utils.calculateFutureDate(AheadOf.Day,0,"MMM d, yyyy"));

});