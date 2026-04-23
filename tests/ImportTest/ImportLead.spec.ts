import { test, expect } from "@playwright/test";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from "../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts";
import { ImportPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportPage.ts";
import { ImportListingPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportListingPage.ts";
import { ImportFilePage } from "../../pages/AdminAndSupportPages/ImportPages/ImportFilePage.ts";
import { ImportConfigurationPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportConfigurationPage.ts";
import { BulkActionAPIUtils } from "../../utils/APIUtils/BulkActionAPIUtils.ts";
import { XLUtils } from "../../utils/XLGenerator/XLUtils.ts";
import { LeadImportCSVGenerator } from "../../utils/CSVGenerator/LeadImportCSVGenerator.ts";
import { convertCsvToXls } from "../../utils/converter.ts";
import { CRMAPIUtils, UserRoleFilter } from "../../utils/APIUtils/CRMAPIUtils.ts";

const clientId = properties.Client_id;
const fullAccessAPI = properties.FullAccess_API;
const restrictedAccessAPI = properties.RestrictedAccess_API;

test.describe.configure({ mode: "serial"});
// timeout 100 seconds
test.setTimeout(100000);
test('@smoke Import lead Test', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const importPage = new ImportPage(page);
    const importListingPage = new ImportListingPage(page);
    const importFilePage = new ImportFilePage(page);
    const importConfigurationPage = new ImportConfigurationPage(page);
    const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const leadImportCSVGenerator = new LeadImportCSVGenerator(clientId, fullAccessAPI, restrictedAccessAPI);

    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();
    const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary();
    const channelPartnerSummary = await crmAPIUtils.getFirstActiveChannelPartnerSummary();
  
    // Login
    await loginPage.login(adminUserSummary.email, properties.PASSWORD);
  
    // Navigate to Import Page
    await settingPage.clickOnImport();
  
    // Navigate to Import Followups
    await importPage.clickOnImportLeads();
  
    // Navigate to Import Listing Page
    await importListingPage.clickOnNewUpload();
  
    // Generate File
    const filePathcsv = await leadImportCSVGenerator.importWithALlColumn_CSV(properties.ImportCount, projectSummary.id, salesUserSummary.id, campaignSummary.id, channelPartnerSummary.id);
    const filePath = convertCsvToXls(filePathcsv);
  
    // Validate File Path
    expect(filePath.length).toBeGreaterThan(10);
  
    // Choose File
    await importFilePage.clickOnChooseFile(filePath);
  
    // Choose Project
    await importConfigurationPage.chooseProjectForLeadImport(projectSummary.name);
      
    // Add Admin Email
    await importConfigurationPage.addAdminEmail(adminUserSummary.email);
  
    await utils.sleep(5000);
  
    // Wait for Followup Import
    const leadID = await bulkActionAPIUtils.waitTillLeadImportDone();
  
    await page.reload({ waitUntil: 'networkidle' });

    test.info().annotations.push({
      type: 'Import lead lead ID',
      description: leadID || 'Lead ID not found'
     });

    await utils.safeDeleteFiles([filePath, filePathcsv]);
  });

  test('@smoke Import Reengage lead Test', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const importPage = new ImportPage(page);
    const importListingPage = new ImportListingPage(page);
    const importFilePage = new ImportFilePage(page);
    const importConfigurationPage = new ImportConfigurationPage(page);
    const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const leadImportCSVGenerator = new LeadImportCSVGenerator(clientId, fullAccessAPI, restrictedAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();
    const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary();
    const channelPartnerSummary = await crmAPIUtils.getFirstActiveChannelPartnerSummary();
  
    // Login
    await loginPage.login(adminUserSummary.email, properties.PASSWORD);
  
    // Navigate to Import Page
    await settingPage.clickOnImport();
  
    // Navigate to Import Followups
    await importPage.clickOnImportLeads();
  
    // Navigate to Import Listing Page
    await importListingPage.clickOnNewUpload();
  
    // Generate File
    const filePathcsv = await leadImportCSVGenerator.importWithALlColumnAndReengage_CSV(properties.ImportCount, projectSummary.id, salesUserSummary.id, campaignSummary.id, channelPartnerSummary.id);
    const filePath = convertCsvToXls(filePathcsv);
  
    // Validate File Path
    expect(filePath.length).toBeGreaterThan(10);
  
    // Choose File
    await importFilePage.clickOnChooseFile(filePath);
  
    // Choose Project
    await importConfigurationPage.chooseProjectForLeadImport(projectSummary.name);
      
    // Add Admin Email
    await importConfigurationPage.addAdminEmail(adminUserSummary.email);
  
    await utils.sleep(5000);
  
    // Wait for Followup Import
    await bulkActionAPIUtils.waitTillLeadImportDone();
  
    await page.reload({ waitUntil: 'networkidle' });

    const xlUtils = new XLUtils(filePath);
    const leadID = xlUtils.getCellData("Sheet1", 1, 3);

    test.info().annotations.push({
      type: 'Import reengage lead lead ID',
      description: leadID || 'Lead ID not found'
     });

    await utils.safeDeleteFiles([filePath, filePathcsv]);
  });
