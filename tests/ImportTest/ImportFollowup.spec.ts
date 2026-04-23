import { test, expect } from "@playwright/test";
import { ActivityType, LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils.ts";
import { properties } from "../../properties/v2.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from "../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts";
import { ImportPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportPage.ts";
import { ImportListingPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportListingPage.ts";
import { ImportFilePage } from "../../pages/AdminAndSupportPages/ImportPages/ImportFilePage.ts";
import { ImportConfigurationPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportConfigurationPage.ts";
import { XLUtils } from "../../utils/XLGenerator/XLUtils.ts";
import { BulkActionAPIUtils } from "../../utils/APIUtils/BulkActionAPIUtils.ts";
import { FollowupImportCSVGenerator } from "../../utils/CSVGenerator/FollowupImportCSVGenerator.ts";
import { convertCsvToXls } from "../../utils/converter.ts";
import { CRMAPIUtils, UserRoleFilter } from "../../utils/APIUtils/CRMAPIUtils.ts";

test.describe.configure({ mode: "parallel"});
test('@smoke Import followup Test', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const importPage = new ImportPage(page);
    const importListingPage = new ImportListingPage(page);
    const importFilePage = new ImportFilePage(page);
    const importConfigurationPage = new ImportConfigurationPage(page);
    const bulkActionAPIUtils = new BulkActionAPIUtils(properties.Client_id, properties.FullAccess_API);
    const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const crmAPIUtils = new CRMAPIUtils(properties.Client_id, properties.FullAccess_API);
    const followupImportCSVGenerator = new FollowupImportCSVGenerator(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();
    // Login
    await loginPage.login(adminUserSummary.email, properties.PASSWORD);

    // Navigate to Import Page
    await settingPage.clickOnImport();

    // Navigate to Import Followups
    await importPage.clickOnImportFollowups();

    // Navigate to Import Listing Page
    await importListingPage.clickOnNewUpload();

    // Generate File
    const filePathcsv = await followupImportCSVGenerator.fileGenerate(properties.ImportCount, projectSummary.id, salesUserSummary.id);
    const filePath = convertCsvToXls(filePathcsv);

    // Validate File Path
    expect(filePath.length).toBeGreaterThan(10);

    // Choose File
    await importFilePage.clickOnChooseFile(filePath);
      
    // Add Admin Email
    await importConfigurationPage.addAdminEmail(adminUserSummary.email);
      
    await utils.sleep(5000);

    // Wait for Followup Import
    await bulkActionAPIUtils.waitTillFollowupImportDone();

    await importListingPage.clickOnRefreshButton();

    await utils.waitTillFullPageLoad(page);

    // Validate Updated Date
    const updatedDate = await importListingPage.getSVFUImportListingPageUpdatedDate();
    expect(updatedDate).toContainText(await utils.calculateFutureDate(AheadOf.Day,0,"dd MMM yyyy h"));

    // Validate Total FU and SV
    const totalFUSV = await importListingPage.getSVFUImportListingPageTotalFUSV();
    expect(totalFUSV).toContainText(`Total Followups: ${properties.ImportCount} Existing Followups: 0 Followups With Errors: 0 Uploaded Followups: ${properties.ImportCount}`);
   
    // Validate Intiated By
    const intiatedBy = await importListingPage.getSVFUImportListingPageIntiatedBy();
    expect(intiatedBy).toContainText(adminUserSummary.email);
   
    // Validate Status
    const status = await importListingPage.getSVFUImportListingPageStatus();
    expect(status).toContainText("Uploaded");

    const xlUtils = new XLUtils(filePath);
    const leadID = xlUtils.getCellData("Sheet1", 1, 0);
    const FUType = xlUtils.getCellData("Sheet1", 1, 6);
    const FUStatus = xlUtils.getCellData("Sheet1", 1, 9);
    const projectId = xlUtils.getCellData("Sheet1", 1, 7);
    const salesId = xlUtils.getCellData("Sheet1", 1, 3);
    const subject = xlUtils.getCellData("Sheet1", 1, 5);
    const agenda = xlUtils.getCellData("Sheet1", 1, 8);
    const scheduledOn = xlUtils.getCellData("Sheet1", 1, 4);

    const leadActivity = await leadAPIUtils.getLeadActivity(leadID,ActivityType.Followup);
    expect((leadActivity as any)?.results[0].followup.followup_type).toEqual(FUType);
    expect((leadActivity as any)?.results[0].followup.status).toEqual(FUStatus);
    expect((leadActivity as any)?.results[0].followup.project_id).toEqual(projectId);
    expect((leadActivity as any)?.results[0].followup.sales_id).toEqual(salesId);
    expect((leadActivity as any)?.results[0].followup.subject).toEqual(subject);
    expect((leadActivity as any)?.results[0].followup.agenda).toEqual(agenda);
    expect(await utils.formatDateToIST((leadActivity as any)?.results[0].followup.scheduled_on)).toEqual(scheduledOn);

    test.info().annotations.push({
        type: 'Import followup lead ID',
        description: leadID || 'Lead ID not found'
    });

    await utils.safeDeleteFiles([filePath, filePathcsv]);
});

