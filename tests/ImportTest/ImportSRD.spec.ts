import { test, expect } from "@playwright/test";
import { properties } from "../../properties/v2.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { AutomationPage } from "../../pages/AdminAndSupportPages/AutomationPage.ts";
import { AheadOf, Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { SettingPage } from "../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts";
import { ImportPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportPage.ts";
import { ImportListingPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportListingPage.ts";
import { ImportFilePage } from "../../pages/AdminAndSupportPages/ImportPages/ImportFilePage.ts";
import { ImportConfigurationPage } from "../../pages/AdminAndSupportPages/ImportPages/ImportConfigurationPage.ts";
import { XLUtils } from "../../utils/XLGenerator/XLUtils.ts";
import { BulkActionAPIUtils } from "../../utils/APIUtils/BulkActionAPIUtils.ts";
import { CampaignAPIUtils } from "../../utils/APIUtils/CampaignAPIUtils.ts";
import { CampaignListingPage } from "../../pages/AdminAndSupportPages/CampeignPages/CampeignLisitngPage.ts";
import { CreateCampaignPage } from "../../pages/AdminAndSupportPages/CampeignPages/CreateCampeignPage.ts";
import { CRMAPIUtils, UserRoleFilter } from "../../utils/APIUtils/CRMAPIUtils.ts";
import { convertCsvToXls } from "../../utils/converter.ts";
import { SRDImportCSVGenerator } from "../../utils/CSVGenerator/SRDImportCSVGenerator.ts";

const clientId = properties.Client_id;
const fullAccessAPI = properties.FullAccess_API;

test.describe.configure({ mode: "serial"});
test.fixme('Delete SRD from Campaign', async ({ page }) => {

    const loginPage2 = new LoginPage(page);
    const sidePanal2 = new SidePanal(page);
    const campaignAPIUtils2 = new CampaignAPIUtils(clientId, fullAccessAPI);
    const automationPage2 = new AutomationPage(page);
    const campaignListingPage2 = new CampaignListingPage(page);
    const createCampaignPage2 = new CreateCampaignPage(page);

    // Login
    await loginPage2.loginWithClientId(properties.SM_00, properties.PASSWORD, clientId);

    // Navigate to Campaign Listing Page
    await sidePanal2.clickOnAutomation();

    // Navigate to Campaign Listing Page
    await automationPage2.clickOnCampaignSetup();

    // Click on Filter Button
    await campaignListingPage2.clickOnFilterButton(properties.CampaignNameForImportSRD);

    // Get Campaign Name
    const campaignName = await campaignListingPage2.getCampaignName();
    expect(campaignName).toContain(properties.CampaignNameForImportSRD);

    // Get Campaign Project List
    const campaignProjectList = await campaignListingPage2.getCampaignProjectList();
    expect(campaignProjectList).toContain("Not a Project-specific campaign");

    // Get Campaign Status List
    const campaignStatusList = await campaignListingPage2.getCampaignStatusList();
    expect(campaignStatusList).toContain("Active");

    // Click on Action Edit Button
    await campaignListingPage2.clickOnActionEditButton();

    // Click on Input Channel
    await createCampaignPage2.clickOnInputChannel();

    // Get SRD Listing
    const arys = await createCampaignPage2.getSRDListing();
    for(const ary of arys){
        const srdId = await ary.textContent();
        if (srdId) {
            await campaignAPIUtils2.deleteSRD(srdId);
        }
    }

});

test.fixme('Import SRD Test', async ({ page }) => { // SRD API are not working as expected

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const importPage = new ImportPage(page);
    const importListingPage = new ImportListingPage(page);
    const importFilePage = new ImportFilePage(page);
    const importConfigurationPage = new ImportConfigurationPage(page);
    const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
    const sidePanal = new SidePanal(page);
    const srdImportCSVGenerator = new SRDImportCSVGenerator(clientId, fullAccessAPI);
    const automationPage = new AutomationPage(page);
    const campaignListingPage = new CampaignListingPage(page);
    const createCampaignPage = new CreateCampaignPage(page);

    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();
    const campaignSummary = await crmAPIUtils.getFirstActiveCampaignSummary();

    const campaignSource = await crmAPIUtils.dataProvider_Source({ index: 1 });
    const campaignSubSource = await crmAPIUtils.dataProvider_SubSource({ index: 1 });

    await loginPage.loginWithClientId(properties.SM_00, properties.PASSWORD, clientId);

    // 1) Campaign → Input Channel: baseline SRD row count before import
    await sidePanal.clickOnAutomation();
    await automationPage.clickOnCampaignSetup();
    await campaignListingPage.clickOnFilterButton(campaignSummary.name);

    const campaignName = await campaignListingPage.getCampaignName();
    expect(campaignName).toContain(campaignSummary.name);

    const campaignProjectList = await campaignListingPage.getCampaignProjectList();
    expect(campaignProjectList).toContain("Not a Project-specific campaign");

    const campaignStatusList = await campaignListingPage.getCampaignStatusList();
    expect(campaignStatusList).toContain("Active");

    await campaignListingPage.clickOnActionEditButton();
    await createCampaignPage.clickOnInputChannel();

    const arys = (await createCampaignPage.getSRDListing()).length;

    // 2) Import → SRD upload
    await sidePanal.clickOnSettings();
    await settingPage.clickOnImport();
    await importPage.clickOnImportSRDs();
    await importListingPage.clickOnNewUpload();

    // Generate File
    const filePathcsv = await srdImportCSVGenerator.FileGeneratorForSRD(properties.ImportCount, projectSummary.id, salesUserSummary.id, campaignSummary.id, campaignSource.text, campaignSubSource.text);
    const filePath = convertCsvToXls(filePathcsv);

    // Validate File Path
    expect(filePath.length).toBeGreaterThan(10);

    // Choose File
    await importFilePage.clickOnChooseFile(filePath);
      
    // Add Admin Email
    await importConfigurationPage.addAdminEmail(adminUserSummary.email);
      
    await utils.sleep(5000);

    // Wait for Followup Import
    await bulkActionAPIUtils.waitTillSRDImportDone();

    //await importListingPage.clickOnRefreshButton();

    await utils.waitTillFullPageLoad(page);

    // Validate Updated Date
    const updatedDate = await importListingPage.getSVFUImportListingPageUpdatedDate();
    expect(updatedDate).toContainText(await utils.calculateFutureDate(AheadOf.Day,0,"DD"));

    // Validate Total FU and SV
    const totalFUSV = await importListingPage.getSVFUImportListingPageTotalFUSV();
    expect(totalFUSV).toContainText(`Total Srds: ${properties.ImportCount}`);
   
    // Validate Intiated By
    const intiatedBy = await importListingPage.getSVFUImportListingPageIntiatedBy();
    expect(intiatedBy).toContainText(adminUserSummary.email);
   
    // Validate Status
    const status = await importListingPage.getSVFUImportListingPageStatus();
    expect(status).toContainText("Uploaded");

    const xlUtils = new XLUtils(filePath);
    const ApiClient = xlUtils.getCellData("Sheet1", 1, 0);

    // 3) Campaign → Input Channel again: SRD count after import (same path as step 1)
    await sidePanal.clickOnAutomation();
    await automationPage.clickOnCampaignSetup();
    await campaignListingPage.clickOnFilterButton(campaignSummary.name);
    expect(await campaignListingPage.getCampaignName()).toContain(campaignSummary.name);
    expect(await campaignListingPage.getCampaignProjectList()).toContain("Not a Project-specific campaign");
    expect(await campaignListingPage.getCampaignStatusList()).toContain("Active");
    await campaignListingPage.clickOnActionEditButton();
    await createCampaignPage.clickOnInputChannel();

    const arys2 = (await createCampaignPage.getSRDListing()).length;
    expect(arys2).toBe(arys + 2);

    expect(ApiClient).toContain(await createCampaignPage.getInputAPIChannel());

    await utils.safeDeleteFiles([filePath, filePathcsv]);
});
