import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/CommonPages/loginPage";
import { UserDashboard } from "../../pages/AdminAndSupportPages/UserDashboardPages/DashboardPage";
import { LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils";
import { CalligAPIUtils, CallDirection, CallStatus } from "../../utils/APIUtils/CallingAPIUtils";
import { Utils } from "../../utils/PlaywrightTestUtils";
import { properties } from "../../properties/v2";

test('Missed Call Bucket - Create Lead and Missed Call via API', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const userDashboard = new UserDashboard(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const callingAPIUtils = new CalligAPIUtils(properties.Client_id, properties.FullAccess_API);
    const utils = new Utils();

    const phoneNumber = await utils.generateRandomPhoneNumber();
    const leadName = "Missed Call Test Lead " + await utils.generateRandomString(4, { casing: 'lower', includeNumbers: false, includeSpecialChars: false });

    //  Login
    await loginPage.login(properties.Dashboard_Sale_email, properties.PASSWORD);

    await userDashboard.refreshDashboard();
    const initialMissedCallsCount = await userDashboard.getMissedCallsCount();

    const leadResponse = await leadAPIUtils.createLeadWithDetails(
        phoneNumber,
        await utils.generateRandomEmail(),
        leadName,
        "Website",
        "Organic",
        properties.Project_id,
        properties.Dashboard_Sale_id
    );

    expect(leadResponse.sell_do_lead_id).toBeDefined();

    await callingAPIUtils.AddOfflineCall(
        leadResponse.sell_do_lead_id,
        CallDirection.Incoming,
        CallStatus.NotAnswered,
        0,
        properties.Dashboard_Sale_email,
        false
    );

    await userDashboard.refreshDashboard();
    const finalMissedCallsCount = await userDashboard.getMissedCallsCount();

    // Verify count increased
    expect(finalMissedCallsCount).toBe(initialMissedCallsCount + 1);
    await callingAPIUtils.AddOfflineCall(
        leadResponse.sell_do_lead_id,
        CallDirection.Incoming,
        CallStatus.Answered,
        1,
        properties.Dashboard_Sale_email,
        false
    );
    await userDashboard.refreshDashboard();
    const finalMissedCallsCountAfterAnswered = await userDashboard.getMissedCallsCount();

    // Verify count decreased
    expect(finalMissedCallsCountAfterAnswered).toBe(finalMissedCallsCount - 1);
});

