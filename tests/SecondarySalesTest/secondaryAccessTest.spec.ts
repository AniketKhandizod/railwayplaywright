import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { LeadProfilePage } from '../../pages/UserPages/leadProfilePage.ts';

test('Secondary Sales Access Test by API', async ({ page }) => {
    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);

    await loginPage.login(properties.PreSales_email, properties.PASSWORD);
    const leadId = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Secondary access test lead","","","",properties.Sales_id,"");
    await globalSearchPage.globalSearch("#"+leadId.sell_do_lead_id);
    await leadPage.isSecondaryAccessPresent(false);

    const leadDetails = await leadAPIUtils.getLeadDetails(leadId.sell_do_lead_id);
    expect(leadDetails.secondary_sale_ids[0]).toBe(undefined);
    await leadAPIUtils.addSecondarySalesAccess(leadId.sell_do_lead_id, properties.PreSales_id);

    await page.reload();

    await utils.waitTillFullPageLoad(page);
    const leadDetails2 = await leadAPIUtils.getLeadDetails(leadId.sell_do_lead_id);
    expect(leadDetails2.secondary_sale_ids[0]).toBe(properties.PreSales_id);
    await leadPage.isSecondaryAccessPresent(true);

});

test('Secondary Sales Access Test by UI', async ({ browser }) => {

    const context = await browser.newContext();
    const page = await context.newPage();

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const loginPage2 = new LoginPage(page2);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const globalSearchPage2 = new GlobalSearchPage(page2);
    const leadPage = new LeadProfilePage(page);
    const leadPage2 = new LeadProfilePage(page2);
    const notyMessage = new NotyMessage(page);

    // Login as admin browser - 1
    await loginPage.login(properties.Admin_email, properties.PASSWORD);
    const leadId = await leadAPIUtils.createLeadWithDetails(await utils.generateRandomPhoneNumber(), await utils.generateRandomEmail(),"Secondary access test lead","","","",properties.Sales_id,"");
    await globalSearchPage.globalSearch("#"+leadId.sell_do_lead_id);

    // Login as sales browser - 2
    await loginPage2.login(properties.PreSales_email, properties.PASSWORD);
    await globalSearchPage2.globalSearch("#"+leadId.sell_do_lead_id);
    await leadPage2.isSecondaryAccessPresent(false);
    //await leadPage2.isPullButtonVisibleForSales(true);
    
    // Add secondary sales by admin browser - 1
    await leadPage.clickOnAddSecondaryAccess();
    await leadPage.enterSecondarySales(properties.PreSales_name);
    await leadPage.clickOnSaveSecondaryAccess();

    // Verify noty message by admin browser - 1
    const notyMessageText = await notyMessage.getNotyMessage(true);
    expect(notyMessageText).toBe("Secondary sales have been updated successfully.");
    await context.close();

    // Reload sales browser - 2
    await page2.reload();
    await leadPage2.isSecondaryAccessPresent(true);
    //await leadPage2.isPullButtonVisibleForSales(true);

});

test('Add and Remove Secondary Access via API and Verify on UI', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const globalSearchPage = new GlobalSearchPage(page);
    const leadPage = new LeadProfilePage(page);

    // Step 1: Create lead via API (no admin login needed)
    const leadId = await leadAPIUtils.createLeadWithDetails(
        await utils.generateRandomPhoneNumber(), 
        await utils.generateRandomEmail(),
        "Secondary access add remove test lead via API",
        "",
        "",
        "",
        properties.Sales_id,
        ""
    );

    // Step 2: Login as sales user to verify UI
    await loginPage.login(properties.PreSales_email, properties.PASSWORD);
    await globalSearchPage.globalSearch("#"+leadId.sell_do_lead_id);
    
    // Step 3: Verify sales does not have secondary access initially (UI check)
    await leadPage.isSecondaryAccessPresent(false);
    
    // Step 4: Verify via API that no secondary access exists
    const leadDetailsBefore = await leadAPIUtils.getLeadDetails(leadId.sell_do_lead_id);
    expect(leadDetailsBefore.secondary_sale_ids === undefined || leadDetailsBefore.secondary_sale_ids?.length === 0).toBe(true);
    
    // Step 5: Add secondary sales access via API
    await leadAPIUtils.addSecondarySalesAccess(leadId.sell_do_lead_id, properties.PreSales_id);

    // Step 6: Reload page and verify access is present on UI
    await page.reload();
    await utils.waitTillFullPageLoad(page);
    await leadPage.isSecondaryAccessPresent(true);
    
    // Step 7: Verify via API that secondary access was added
    const leadDetailsAfterAdd = await leadAPIUtils.getLeadDetails(leadId.sell_do_lead_id);
    expect(leadDetailsAfterAdd.secondary_sale_ids).toContain(properties.PreSales_id);
    
    // Step 8: Remove secondary sales access via API
    await leadAPIUtils.removeSecondarySalesAccess(leadId.sell_do_lead_id);

    // Step 9: Reload page and verify access is removed on UI
    await page.reload();
    await utils.waitTillFullPageLoad(page);
    await leadPage.isSecondaryAccessPresent(false);
    
    // Step 10: Verify via API that secondary access was removed
    const leadDetailsAfterRemove = await leadAPIUtils.getLeadDetails(leadId.sell_do_lead_id);
    expect(leadDetailsAfterRemove.secondary_sale_ids === undefined || leadDetailsAfterRemove.secondary_sale_ids?.length === 0).toBe(true);

});