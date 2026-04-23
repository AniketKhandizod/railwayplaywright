import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils, FollowupType } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { Utils, AheadOf } from "../../utils/PlaywrightTestUtils.ts";
import { GlobalSearchPage } from "../../pages/AdminAndSupportPages/GlobalSearchPage.ts";
import { LeadProfilePage } from "../../pages/UserPages/leadProfilePage.ts";
import { NotyMessage } from "../../pages/AdminAndSupportPages/NotyMessage.ts";
import { addFollowUpForm } from "../../pages/UserPages/Forms/FollowupForm.ts";

test('Cancel existing followup and add new followup', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const utils = new Utils();
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);
    const followUpForm = new addFollowUpForm(page);
    await loginPage.login(properties.Dashboard_Sale_email, properties.PASSWORD);
    await utils.waitTillFullPageLoad(page);

    const leadName = await utils.generateRandomString(10);

    const lead = await leadAPIUtils.createLeadWithDetails(
        await utils.generateRandomPhoneNumber(),
        await utils.generateRandomEmail(),
        leadName,
        "",
        "",
        properties.Project_id,
        properties.Dashboard_Sale_id,
        ""
    );

    expect(lead.sell_do_lead_id).toBeDefined();

    const followupDate = await utils.calculateFutureDate(AheadOf.Day, 1, "yyyy-MM-dd HH:mm");

    const followupResponse = await leadAPIUtils.scheduleFollowup(
        lead.sell_do_lead_id,
        followupDate,
        properties.Dashboard_Sale_email,
        FollowupType.Call,
        "Test Subject",
        "Test Agenda"
    );

    expect(followupResponse.followup).toBeDefined();

    await globalSearchPage.globalSearch("#" + lead.sell_do_lead_id);
    await leadPage.clickOnFollowUpTab();
    await utils.waitTillFullPageLoad(page);
    expect(await followUpForm.getFollowupStatus()).toBe("Scheduled");

    await leadPage.clickOnFollowUpActionButton();
    await utils.waitTillFullPageLoad(page);


    await followUpForm.selectFirstCancellationReason();
    await followUpForm.clickOnAddNewFollowupButton();
    await utils.waitTillFullPageLoad(page);
    expect(await followUpForm.getCancellationMessageText()).toContain("This will cancel the current follow up");

    await followUpForm.clickOnCancelAndScheduleButton();

    await utils.waitTillFullPageLoad(page);
    const notyMessage = new NotyMessage(page);
    expect(await notyMessage.getNotyMessage(false)).toBe("Followup call scheduled successfully");

});
