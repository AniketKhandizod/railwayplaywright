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
import { convertCsvToXls } from "../../utils/converter.ts";
import { SitevisitImportCSVGenerator } from "../../utils/CSVGenerator/SitevisitImportCSVGenerator.ts";
import { CRMAPIUtils, UserRoleFilter } from "../../utils/APIUtils/CRMAPIUtils.ts";

test('@smoke Import site visit Test', async ({ page }) => {

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
    const sitevisitImportCSVGenerator = new SitevisitImportCSVGenerator(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();
    // Login
    await loginPage.login(adminUserSummary.email, properties.PASSWORD);
  
    // Navigate to Import Page
    await settingPage.clickOnImport();
  
    // Navigate to Import Followups
    await importPage.clickOnImportSiteVisits();
  
    // Navigate to Import Listing Page
    await importListingPage.clickOnNewUpload();
  
    // Generate File
    const filePathcsv = await sitevisitImportCSVGenerator.FileGeneratorForSiteVisit(properties.ImportCount, projectSummary.id, salesUserSummary.id);
    const filePath = convertCsvToXls(filePathcsv);
    // Validate File Path
    expect(filePath.length).toBeGreaterThan(10);
  
    // Choose File
    await importFilePage.clickOnChooseFile(filePath);
      
    // Add Admin Email
    await importConfigurationPage.addAdminEmail(adminUserSummary.email);
      
    await utils.sleep(5000);
  
    // Wait for Followup Import
    await bulkActionAPIUtils.waitTillSiteVisitImportDone();

    await importListingPage.clickOnRefreshButton();

  //  const notyMessageText = await notyMessage.getNotyMessage(false);
  //  expect(notyMessageText).toEqual("The bulk upload has been completed");
  
    await utils.waitTillFullPageLoad(page);

    // Validate Updated Date
    const updatedDate = await importListingPage.getSVFUImportListingPageUpdatedDate();
    expect(updatedDate).toContainText(await utils.calculateFutureDate(AheadOf.Day,0,"dd MMM yyyy"));

    // Validate Total FU and SV
    const totalFUSV = await importListingPage.getSVFUImportListingPageTotalFUSV();
    expect(totalFUSV).toContainText(`Total Site Visits: ${properties.ImportCount} Existing Site Visits: 0 Site Visits With Errors: 0 Uploaded Site Visits: ${properties.ImportCount} Source: Campaign:`);
   
    // Validate Intiated By
    const intiatedBy = await importListingPage.getSVFUImportListingPageIntiatedBy();
    expect(intiatedBy).toContainText(adminUserSummary.email);
   
    // Validate Status
    const status = await importListingPage.getSVFUImportListingPageStatus();
    expect(status).toContainText("Uploaded");
  
    const xlUtils = new XLUtils(filePath);
    const leadID = xlUtils.getCellData("Sheet1", 1, 0);
    const projectId = xlUtils.getCellData("Sheet1", 1, 4);
    const statusOfSV = xlUtils.getCellData("Sheet1", 1, 8);
    const agenda = xlUtils.getCellData("Sheet1", 1, 7);
    const notes = xlUtils.getCellData("Sheet1", 1, 10);
    const sitevisitType = xlUtils.getCellData("Sheet1", 1, 16);
    const scheduledOn = xlUtils.getCellData("Sheet1", 1, 5);
    const endsOn = xlUtils.getCellData("Sheet1", 1, 6);

    const lead = await leadAPIUtils.getLeadDetails(leadID);
    expect((lead as any)?.total_site_visit_scheduled_count).toEqual(1);

    const leadActivity = await leadAPIUtils.getLeadActivity(leadID,ActivityType.SiteVisit);
    expect((leadActivity as any)?.results[0].site_visit.project_id).toEqual(projectId);
    expect((leadActivity as any)?.results[0].site_visit.status).toEqual(statusOfSV);
    expect((leadActivity as any)?.results[0].site_visit.agenda).toEqual(agenda);
    expect((leadActivity as any)?.results[0].site_visit.generated_via_ai).toEqual(false);
    expect((leadActivity as any)?.results[0].site_visit.notes).toEqual(notes);
    expect((leadActivity as any)?.results[0].site_visit.sitevisit_type).toEqual(sitevisitType);
    expect(await utils.formatDateToIST((leadActivity as any)?.results[0].site_visit.scheduled_on)).toEqual(scheduledOn);
    expect(await utils.formatDateToIST((leadActivity as any)?.results[0].site_visit.ends_on)).toEqual(endsOn);
    expect((leadActivity as any)?.results[0].site_visit.initiated_by).toEqual(salesUserSummary.id);
    expect((leadActivity as any)?.results[0].site_visit.campaign_info.project_names).toEqual(projectSummary.name);

    const emailOfLead = xlUtils.getCellData("Sheet1", 1, 1);
    const leadDetails = await leadAPIUtils.leadRetrieve(emailOfLead);
    expect((leadDetails as any)?.lead.campaigns[0].name).toEqual((leadActivity as any)?.results[0].site_visit.campaign_info.name);
    expect((leadDetails as any)?.lead.campaigns[0].source).toEqual((leadActivity as any)?.results[0].site_visit.campaign_info.source);
    expect((leadDetails as any)?.lead.campaigns[0].medium_type).toEqual((leadActivity as any)?.results[0].site_visit.campaign_info.medium_type);
    expect((leadDetails as any)?.lead.campaigns[0].sub_source).toEqual((leadActivity as any)?.results[0].site_visit.campaign_info.sub_source);
    
    test.info().annotations.push({
      type: 'Import site visit lead ID',
      description: leadID || 'Lead ID not found'
     });

    await utils.safeDeleteFiles([filePath, filePathcsv]);
  });