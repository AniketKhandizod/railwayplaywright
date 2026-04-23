import { test, expect } from '@playwright/test';
import { properties } from '../../properties/v2';
import { Utils, AheadOf } from '../../utils/PlaywrightTestUtils';
import { LoginPage } from '../../pages/CommonPages/loginPage';
import { SiteVisitPage, SiteVisitType } from '../../pages/UserPages/Forms/SiteVisitForm';
import { ActivityType, LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils';
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage';
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal';
import { SettingPage } from '../../pages/AdminAndSupportPages/SettingsPages/SettingPage';
import { ManageActivityPage } from '../../pages/AdminAndSupportPages/SettingsPages/LeadSettingsPages/ManageActivityPage';
import { LeadSettingsPage } from '../../pages/AdminAndSupportPages/SettingsPages/LeadSettingsPages/LeadSettingsPage';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage';
import dayjs from 'dayjs';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage';

test('Validate all site visit', async ({ page }) => {
const utils = new Utils();
const loginPage = new LoginPage(page);
const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
const siteVisitPage = new SiteVisitPage(page);
const leadPage = new LeadProfilePage(page);
const globalSearchPage = new GlobalSearchPage(page);
const leadsName ="Site visit test "+ await utils.generateRandomString(10,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
const startDate = await utils.calculateFutureDate(AheadOf.Minute,10,"yyyy-MM-dd HH:mm")+" IST"; 
const endDate = await utils.calculateFutureDate(AheadOf.Minute,25,"yyyy-MM-dd HH:mm")+" IST"; 
await loginPage.login(properties.SV_Sales_email, properties.PASSWORD);

let leadForSiteVisit = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), "",leadsName,"","","",properties.SV_Sales_id,"");

//extract lead id
const leadId = leadForSiteVisit.sell_do_lead_id;
// navigate to the lead detail page
await globalSearchPage.globalSearch("#"+leadId);
await utils.waitTillFullPageLoad(page);

//schedule confirmed site visit
await siteVisitPage.SiteVisitButtonClick();
await siteVisitPage.SelectProjectClick();
await siteVisitPage.SiteVisitTypeClick(SiteVisitType.Visit);
await siteVisitPage.ScheduleSiteVisitClick();
await page.waitForTimeout(2000);
await siteVisitPage.ScheduledActivityIgnoreClick();
await utils.waitTillFullPageLoad(page);
await siteVisitPage.SiteVisitCreatedCheck();
await siteVisitPage.SiteVisitTabClick();
expect(await siteVisitPage.SiteVisitCardCheck()).toBeTruthy();
await utils.waitTillFullPageLoad(page);
const SV = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
expect(SV.results[0].site_visit.status).toBe("scheduled");
expect(SV.results[0].site_visit.sales_id).toContain(properties.SV_Sales_id);

//create tentative site visit
await siteVisitPage.SiteVisitButtonClick();
await siteVisitPage.SelectProjectClick();
await siteVisitPage.SiteVisitTypeClick(SiteVisitType.Visit);
await siteVisitPage.TentativeActivityChangeClick();
await siteVisitPage.ScheduleSiteVisitClick();
await page.waitForTimeout(2000);
await siteVisitPage.ScheduledActivityIgnoreClick();
await siteVisitPage.SiteVisitCreatedCheck();
await utils.waitTillFullPageLoad(page);
await siteVisitPage.SiteVisitTabClick();
expect(await siteVisitPage.SiteVisitCardCheck()).toBeTruthy();
const SV1 = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
expect(SV1.results[0].site_visit.confirmed).toBe(false);
await utils.waitTillFullPageLoad(page);

//confirm tentative site visit
await siteVisitPage.SiteVisitTabClick();
await siteVisitPage.SiteVisitOptionsClick();
await siteVisitPage.ConfirmSiteVisitClick();
const SV2 = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
expect(SV2.results[0].site_visit.confirmed).toBe(true);

//create site visit with attachment
await siteVisitPage.SiteVisitButtonClick();
await siteVisitPage.SelectProjectClick();
await siteVisitPage.SiteVisitTypeClick(SiteVisitType.Visit);
await siteVisitPage.SiteVisitUploadAttachment();
await siteVisitPage.ScheduleSiteVisitClick();
await page.waitForTimeout(2000);
await siteVisitPage.ScheduledActivityIgnoreClick();
await siteVisitPage.SiteVisitCreatedCheck();
await utils.waitTillFullPageLoad(page);
await siteVisitPage.SiteVisitTabClick();
const SV3 = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
expect(SV3.results[0].site_visit.asset_info?.length).toBeGreaterThan(0);

//reschedule site visit
await page.reload({ waitUntil: 'networkidle' });
await siteVisitPage.SiteVisitTabClick();
await siteVisitPage.SiteVisitCardCheck();
await siteVisitPage.SiteVisitOptionsClick();
await siteVisitPage.RescheduleSiteVisitClick();
await siteVisitPage.SVDatePickerClick();
await siteVisitPage.SelectNextDate();
await siteVisitPage.SVRescheduleClick();
await page.waitForTimeout(2000);
await siteVisitPage.ScheduledActivityIgnoreClick();
await siteVisitPage.SiteVisitCreatedCheck();
await utils.waitTillFullPageLoad(page);
await siteVisitPage.SiteVisitTabClick();
const SV4 = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
const endsOnDate = new Date(SV4.results[0].site_visit.ends_on);
const endsOn = new Date(endsOnDate).toISOString().split("T")[0];
expect(endsOn).toBe(await utils.calculateFutureDate(AheadOf.Day, 1, "yyyy-MM-dd"));

//add invitee
await page.reload({ waitUntil: 'networkidle' });
await siteVisitPage.SiteVisitTabClick();
await siteVisitPage.SiteVisitOptionsClick();
const SalesName = await siteVisitPage.SiteVisitAddInviteeClick();
await utils.waitTillFullPageLoad(page);
await loginPage.logout();
await loginPage.loginWithClientId(properties.SM_07, properties.PASSWORD, properties.SV_Client_id);
await siteVisitPage.SiteVisitAddedInviteeCheck(leadId);
const secondarySalesArray = await siteVisitPage.SiteVisitAddedInviteeCheck(leadId);
expect(secondarySalesArray).toContain(SalesName);
await loginPage.logout();

//Mark Did Not Visit
await loginPage.login(properties.SV_Sales_email, properties.PASSWORD);
await globalSearchPage.globalSearch("#"+leadId);
await utils.waitTillFullPageLoad(page);
await siteVisitPage.SiteVisitTabClick();
await siteVisitPage.SiteVisitOptionsClick();
await siteVisitPage.MarkDidNotVisit();
await utils.waitTillFullPageLoad(page);
const SV5 = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
expect(SV5.results[0].site_visit.status).toBe("missed");

//Add SV and Mark Not Interested
await leadAPIUtils.scheduleSiteVisit(leadId, startDate, endDate, properties.SV_Sales_email, properties.Project_id, false, "", "", SiteVisitType.Visit, properties.SV_Team_id, "", "", true, false);
await siteVisitPage.SiteVisitTabClick();
await siteVisitPage.SiteVisitOptionsClick();
await siteVisitPage.MarkNotInterested();
await utils.waitTillFullPageLoad(page);
const SV6 = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
expect(SV6.results[0].site_visit.status).toBe("dropped");

//Add SV and Mark Conducted
await leadAPIUtils.scheduleSiteVisit(leadId, startDate, endDate, properties.SV_Sales_email, properties.Project_id, false, "", "", SiteVisitType.Visit, properties.SV_Team_id, "", "", true, false);
await siteVisitPage.SiteVisitTabClick();
await siteVisitPage.SiteVisitOptionsClick();
await siteVisitPage.MarkConducted();
await siteVisitPage.MarkConductedButtonClick();
await utils.waitTillFullPageLoad(page);
const SV7 = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
expect(SV7.results[0].site_visit.status).toBe("conducted");

//Add Conducted SV
await leadPage.clickOnMoreButton();
await leadPage.clickOnConductedSiteVisitActionButton();
await utils.waitTillFullPageLoad(page);
await siteVisitPage.SelectProjectClick();
await siteVisitPage.SiteVisitTypeClick(SiteVisitType.Visit);
await siteVisitPage.MarkConductedButtonClick();
const SV8 = await leadAPIUtils.getLeadActivity(leadId, ActivityType.SiteVisit);
expect(SV8.results[0].site_visit.status).toBe("conducted");
});

//Site Visit Duration validation
test.describe.configure({ mode: "serial"});
test('Site Visit Duration validation', async ({ browser }) => {
const utils = new Utils();
const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

// Create two isolated browser contexts
const supportContext = await browser.newContext();
const salesContext = await browser.newContext();

// Create pages for each context
const supportPage = await supportContext.newPage();
const salesPage = await salesContext.newPage();

// Initialize page objects for each context
const supportLoginPage = new LoginPage(supportPage);
const salesLoginPage = new LoginPage(salesPage);
const salesSiteVisitPage = new SiteVisitPage(salesPage);
const salesGlobalSearchPage = new GlobalSearchPage(salesPage);
const supportSidePanal = new SidePanal(supportPage);
const supportSettingPage = new SettingPage(supportPage);
const supportManageActivityPage = new ManageActivityPage(supportPage);
const supportLeadSettingsPage = new LeadSettingsPage(supportPage);
const supportNotyMessage = new NotyMessage(supportPage);

    // Step 1: Support Manager (SM_07) configures site visit validation settings
    await supportLoginPage.loginWithClientId(properties.SM_07, properties.PASSWORD, properties.SV_Client_id);

    // Navigate to settings
    await supportSidePanal.clickOnSettings();
    await supportSettingPage.clickOnLeadSettings();
    await supportLeadSettingsPage.clickOnManageActivitySettings();

    // Configure site visit validation
    await supportManageActivityPage.clickOnEnableActivityValidation();
    const hours = 0; //min 0 max 23 **NOT WORKING FOR MORE THAN 1 HOUR DUE TO ESTATE-18670**
    const minutes = 30; //min 0 max 59
    const totalDifference = (Number(hours) * 60) + Number(minutes);
    await supportManageActivityPage.SelectSiteVisitValidationTime(`${hours}`, `${minutes}`);  // 1 Hour, 30 Minutes
    const startday = 0; //min 0 (current day). Need to keep it 0 if start hours is 1, else won't trigger validation error.
    const endday = 6; 
    await supportManageActivityPage.SelectStartAndEndDaySiteVisit(`${startday}`, `${endday}`); // Start: 0 Days, End: 6 Days
    await supportManageActivityPage.SaveSiteVisitValidation();
    expect(await supportNotyMessage.getNotyMessage(true)).toBe("Activity Configuration updated successfully");

    // Step 2: Sales User (SV_Sales_email) performs site visit operations
    await salesLoginPage.loginWithClientId(properties.SV_Sales_email, properties.PASSWORD, properties.SV_Client_id);

    // Create a test lead for site visit
    const leadsName = "Site Visit Duration Test " + await utils.generateRandomString(10, {casing:'lower',includeNumbers:false,includeSpecialChars:false});
    let leadForSiteVisit = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(),"",leadsName,"","","",properties.SV_Sales_id,"");
    const leadId = leadForSiteVisit.sell_do_lead_id;

    // Step 3: Validate site visit duration constraints
    // Sales User attempts to create another site visit with invalid duration
    await utils.waitTillFullPageLoad(salesPage);
    await salesGlobalSearchPage.globalSearch("#" + leadId);
    await utils.waitTillFullPageLoad(salesPage);
    await salesSiteVisitPage.SiteVisitButtonClick();
    await salesSiteVisitPage.SelectProjectClick();
    await salesSiteVisitPage.SiteVisitTypeClick(SiteVisitType.Visit);

    // Check the default selected time is within the allowed range
    const differenceMins = await salesSiteVisitPage.SVTimePickerGetTime();
    expect(differenceMins).toBe(totalDifference);

    // Try to schedule with a duration outside the allowed range
    const invalidStartTime = await utils.calculateFutureDate(AheadOf.Hour, 1, "h mm a"); // 1 hours from now 
    const invalidEndTime = await utils.calculateFutureDate(AheadOf.Hour, 1.2, "h mm a"); // 1.5 hours from now(less than 1 hour limit)
    // This should trigger validation error
    await salesSiteVisitPage.EnterSiteVisitCustomTime(invalidStartTime, invalidEndTime);
    await salesSiteVisitPage.ScheduleSiteVisitClick();
    await salesSiteVisitPage.isValidationErrorVisible();
    
    await salesPage.on('dialog', async (dialog) => {
        await dialog.accept();
    });
    await salesSiteVisitPage.SiteVisitCloseButtonClick();

    // Step 4: Test site visit date range validation (0-2 days)
    // Verify active dates in the date picker are within the allowed range

    await salesSiteVisitPage.SiteVisitButtonClick();
    await salesSiteVisitPage.SelectProjectClick();
    await salesSiteVisitPage.SiteVisitTypeClick(SiteVisitType.Visit);
    await salesSiteVisitPage.SVDatePickerClick();
    const activeDates = await salesPage.$$eval('td[class^="day"],td[class^="active"]', els =>
        els.map(el => el.textContent.trim())
      );

    const expectedDates = Array.from({ length: Number(endday) - Number(startday) + 1 }, (_, i) =>
        dayjs().add(Number(startday) + i, 'day').format("D") // "D" = day of month without leading zero
      );
    expect(activeDates).toEqual(expectedDates);

    await supportContext.close();
    await salesContext.close();

});