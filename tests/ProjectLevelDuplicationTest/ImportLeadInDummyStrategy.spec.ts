import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { LeadImportCSVGenerator } from "../../utils/CSVGenerator/LeadImportCSVGenerator.ts";
import { convertCsvToXls } from "../../utils/converter.ts";
import { SettingPage } from '../../pages/AdminAndSupportPages/SettingsPages/SettingPage.ts';
import { ImportPage } from '../../pages/AdminAndSupportPages/ImportPages/ImportPage.ts';
import { ImportListingPage } from '../../pages/AdminAndSupportPages/ImportPages/ImportListingPage.ts';
import { ImportFilePage } from '../../pages/AdminAndSupportPages/ImportPages/ImportFilePage.ts';
import { ImportConfigurationPage } from '../../pages/AdminAndSupportPages/ImportPages/ImportConfigurationPage.ts';
import { BulkActionAPIUtils } from '../../utils/APIUtils/BulkActionAPIUtils.ts';
import { GlobalSearchPage } from '../../pages/AdminAndSupportPages/GlobalSearchPage.ts';
import { XLUtils } from '../../utils/XLGenerator/XLUtils.ts';
import { LeadAPIUtils } from '../../utils/APIUtils/LeadAPIUtils.ts';
import { CRMAPIUtils, UserRoleFilter } from '../../utils/APIUtils/CRMAPIUtils.ts';
import { UserAPIUtils } from '../../utils/APIUtils/UserAPIUtils.ts';

const clientId = properties.Project_Duplicate_Client_Id;
const fullAccessAPI = properties.Project_Duplicate_FullAccess_API;
const restrictedAccessAPI = properties.Project_Duplicate_RestrictedAccess_API;

test('Import lead in dummy strategy', async ({ browser }) => {

    const context = await browser.newContext();
    const page = await context.newPage();

    const utils = new Utils();
    const loginPage = new LoginPage(page);
    const settingPage = new SettingPage(page);
    const importPage = new ImportPage(page);
    const importListingPage = new ImportListingPage(page);
    const importFilePage = new ImportFilePage(page);
    const importConfigurationPage = new ImportConfigurationPage(page);
    const leadImportCSVGenerator = new LeadImportCSVGenerator(clientId, fullAccessAPI, restrictedAccessAPI);
    const bulkActionAPIUtils = new BulkActionAPIUtils(clientId, fullAccessAPI);
    const leadAPIUtils = new LeadAPIUtils(clientId, fullAccessAPI, restrictedAccessAPI);
    const crmAPIUtils = new CRMAPIUtils(clientId, fullAccessAPI);
    const userAPIUtils = new UserAPIUtils(clientId, fullAccessAPI);
    const adminUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Admin);
    const salesUserSummary = await crmAPIUtils.getFirstActiveUserSummary(UserRoleFilter.Sales);
    const salesTeamSummary =  (await userAPIUtils.getUserTeamIdAndName(salesUserSummary.id)).teamName;
    const projectSummary = await crmAPIUtils.getFirstActiveProjectSummary();


    // Global constants
    const leadCampaign = "Organic";
    const leadSource = "Broker";
    const leadSubSource = "sss";
    const leadMedium = "Email";
    const leadDepartment = "Sales";
    const leadTeam = salesTeamSummary;
    const leadSales = salesUserSummary.name;
    const leadStage = "incoming";
  
    // Login
    await loginPage.login(adminUserSummary.email, properties.PASSWORD);
  
    // Navigate to Import Page
    await settingPage.clickOnImport();
  
    // Navigate to Import Followups
    await importPage.clickOnImportLeads();
  
    // Navigate to Import Listing Page
    await importListingPage.clickOnNewUpload();
  
    // Generate file (Java `leadImportForDummyUser`: Primary Phone + Primary Email only)
    const filePathcsv = await leadImportCSVGenerator.leadImportForDummyUserCSV(properties.ImportCount);
    const filePath = convertCsvToXls(filePathcsv);
  
    // Validate File Path
    expect(filePath.length).toBeGreaterThan(10);
  
    // Choose File
    await importFilePage.clickOnChooseFile(filePath);
  
    // Select Campaign
    await importConfigurationPage.selectCampaign(leadCampaign);

    // Select Source
    await importConfigurationPage.selectSource(leadSource);

    // Select Sub-source
    await importConfigurationPage.selectSubSource(leadSubSource);

    // Select Medium
    await importConfigurationPage.selectMedium(leadMedium);

    // Select Department
    await importConfigurationPage.selectDepartment(leadDepartment);

    // Select Team
    await importConfigurationPage.selectTeam(leadTeam ?? "");

    // Select Sales
    await importConfigurationPage.selectSales(leadSales);

    // Select Project
    await importConfigurationPage.selectProject(projectSummary.name);

    // Select Lead Stage
    await importConfigurationPage.selectLeadStage(leadStage);
      
    // Add Admin Email
    await importConfigurationPage.addAdminEmail(adminUserSummary.email);
  
    // Wait for Lead Import
    await bulkActionAPIUtils.waitTillLeadImportDone();
  
    await utils.waitTillFullPageLoad(page);

    await context.close();

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    const globalSearch = new GlobalSearchPage(page2);
    const loginPage2 = new LoginPage(page2);

    await loginPage2.login(adminUserSummary.email, properties.PASSWORD);

    // XLS handler
    const xlUtils = new XLUtils(filePath);
    const leadPhoneNumber = xlUtils.getCellData("Sheet1", 1, 0);
    const leadEmail = xlUtils.getCellData("Sheet1", 1, 1);

    await globalSearch.globalSearch(leadEmail);

    await utils.waitTillFullPageLoad(page2);

    const leadDetails = await leadAPIUtils.leadRetrieve(leadEmail);

    // Validate Sales Details
    expect(leadDetails.sales_details.name).toBe(leadSales);

    // Validate Phone Number
    expect(leadDetails.lead.phone).toBe(leadPhoneNumber.split(" ")[1]);

    // Validate Project Details
    expect(leadDetails.lead.project_id).toBe(projectSummary.id);
    expect(leadDetails.lead.interested_projects[0].project_id).toBe(projectSummary.id);
    expect(leadDetails.lead.interested_projects.length).toBe(1);
    expect(leadDetails.lead.interested_projects[0].project_name).toBe(projectSummary.name);

    // Validate Lead Stage
    expect(leadDetails.lead.stage).toBe(leadStage);

    // Validate Lead Exists
    expect(leadDetails.exists).toBe(true);

    await context2.close();

    await utils.safeDeleteFiles([filePath, filePathcsv]);
});