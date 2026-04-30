import { test, expect } from "@playwright/test";
import { Utils } from "../../utils/PlaywrightTestUtils";
import { LoginPage } from "../../pages/CommonPages/loginPage";
import { SettingPage } from "../../pages/AdminAndSupportPages/SettingsPages/SettingPage";
import { ImportPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportPage";
import { ImportListingPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportListingPage";
import { ImportFilePage } from "../../pages/AdminAndSupportPages/ImportPages/ImportFilePage";
import { ImportConfigurationPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportConfigurationPage";
import { BulkActionAPIUtils } from "../../utils/APIUtils/BulkActionAPIUtils";
import { XLUtils } from "../../utils/XLGenerator/XLUtils";
import { LeadImportCSVGenerator } from "../../utils/CSVGenerator/LeadImportCSVGenerator";
import { convertCsvToXls } from "../../utils/converter";
import { CRMAPIUtils, UserRoleFilter } from "../../utils/APIUtils/CRMAPIUtils";
import { LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils";

let clientId = process.env.Client_id ?? '';
let fullAccessAPI = process.env.FullAccess_API ?? '';
let restrictedAccessAPI = process.env.RestrictedAccess_API ?? '';
let password = process.env.PASSWORD ?? '';
let importCount = parseInt(process.env.ImportCount ?? '1');



test.describe.configure({ mode: "serial"});
// timeout 100 seconds
test.setTimeout(1000000);
test('@smoke Import lead Test', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const importPage = new ImportPage(page);
    const importListingPage = new ImportListingPage(page);
    const importFilePage = new ImportFilePage(page);
    const importConfigurationPage = new ImportConfigurationPage(page);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const leadImportCSVGenerator = new LeadImportCSVGenerator(clientId, fullAccessAPI, restrictedAccessAPI);

    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();
    const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary();
    const channelPartnerSummary = await crmAPIUtils.getFirstActiveChannelPartnerSummary();
  
    // Login
    await loginPage.login(adminUserSummary.email, password);
  
    // Navigate to Import Page
    await settingPage.clickOnImport();
  
    // Navigate to Import Followups
    await importPage.clickOnImportLeads();
  
    // Navigate to Import Listing Page
    await importListingPage.clickOnNewUpload();
  
    // Generate File
    const filePathcsv = await leadImportCSVGenerator.importWithALlColumn_CSV(importCount, projectSummary.id, salesUserSummary.id, campaignSummary.id, channelPartnerSummary.id);
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
  
    // Wait for Lead Import
    const leadID = await bulkActionAPIUtils.waitTillLeadImportDone();

    // get lead details
    const leadDetails = await leadAPIUtils.getLeadDetails(leadID);

    await page.reload({ waitUntil: 'networkidle' });

    test.info().annotations.push({
      type: 'Import lead lead ID',
      description: leadID || 'Lead ID not found'
     });


    await utils.print(`Import Lead Test - Lead ID: #${leadDetails.lead_id}`);
    // Delete File
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
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const leadImportCSVGenerator = new LeadImportCSVGenerator(clientId, fullAccessAPI, restrictedAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();
    const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary();
    const channelPartnerSummary = await crmAPIUtils.getFirstActiveChannelPartnerSummary();
  
    // Login
    await loginPage.login(adminUserSummary.email, password);
  
    // Navigate to Import Page
    await settingPage.clickOnImport();
  
    // Navigate to Import Followups
    await importPage.clickOnImportLeads();
  
    // Navigate to Import Listing Page
    await importListingPage.clickOnNewUpload();
  
    // Generate File
    const filePathcsv = await leadImportCSVGenerator.importWithALlColumnAndReengage_CSV(importCount, projectSummary.id, salesUserSummary.id, campaignSummary.id, channelPartnerSummary.id);
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

    // retrive lead details
    const leadDetails = await leadAPIUtils.getLeadDetails(leadID);
    expect(leadDetails.channel_partner_id).toBe(channelPartnerSummary.id);
    expect(leadDetails.sales_id).toBe(salesUserSummary.id);
    expect(leadDetails.last_campaign.id).toBe(campaignSummary.id);

    // Lead retrieve with phone
    const leadDetailsWithPhone = await leadAPIUtils.leadRetrieve_Phone(`${leadDetails.dial_code}${leadDetails.ph_number}`);
    expect(leadDetailsWithPhone.lmi.campaign_responses[1].project_id).toBe(projectSummary.id);
    expect(leadDetailsWithPhone.lmi.re_engaged).toBe(true);
    console.log("campaigns length",leadDetailsWithPhone.lmi.campaign_ids);
    console.log("campaigns length",(leadDetailsWithPhone.lmi.campaign_ids).length);

    test.info().annotations.push({
      type: 'Import reengage lead lead ID',
      description: leadID || 'Lead ID not found'
     });

    await utils.print(`Import Reengage Lead Test - Lead ID: #${leadID}`);
    await utils.safeDeleteFiles([filePath, filePathcsv]);
  });

test('@smoke Import Reengage lead Test with phone only', async ({ page }) => {

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const importPage = new ImportPage(page);
    const importListingPage = new ImportListingPage(page);
    const importFilePage = new ImportFilePage(page);
    const importConfigurationPage = new ImportConfigurationPage(page);
    const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();
    const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary();
    const channelPartnerSummary = await crmAPIUtils.getFirstActiveChannelPartnerSummary();
    const leadImportCSVGenerator = new LeadImportCSVGenerator(clientId, fullAccessAPI, restrictedAccessAPI);
  
    // Login
    await loginPage.login(adminUserSummary.email, password);
  
    // Navigate to Import Page
    await settingPage.clickOnImport();
  
    // Navigate to Import Followups
    await importPage.clickOnImportLeads();
  
    // Navigate to Import Listing Page
    await importListingPage.clickOnNewUpload();
  
    // Generate File
    const filePathcsv = await leadImportCSVGenerator.importWithALlColumnAndReengage_CSV_withPhoneOnly(importCount, projectSummary.id, salesUserSummary.id, campaignSummary.id, channelPartnerSummary.id);
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

    await utils.print(`Import Reengage Lead Test - Lead ID: #${leadID}`);
    await utils.safeDeleteFiles([filePath, filePathcsv]);
  });
