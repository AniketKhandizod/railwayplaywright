import { test, expect } from '@playwright/test';
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal.ts';
import { CreateTowerPage } from '../../pages/InventoryPages/TowerPage/CreateTowerPage.ts';
import { TowerStagesPage } from '../../pages/InventoryPages/TowerPage/TowerStagesPage.ts';
import { PaymentSchedulePage } from '../../pages/InventoryPages/TowerPage/PaymentSchedulePage.ts';
import { SchemePage } from '../../pages/InventoryPages/TowerPage/SchemePage.ts';
import { TowerListingPage } from '../../pages/InventoryPages/TowerPage/TowerListingPage.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';

test('Create Tower', async ({ page }) => {
    // Declare all variables at the beginning
    const loginPage = new LoginPage(page);
    const utils = new Utils();
    const sidePanel = new SidePanal(page);
    const createTowerPage = new CreateTowerPage(page);
    const towerStagesPage = new TowerStagesPage(page);
    const paymentSchedulePage = new PaymentSchedulePage(page);
    const schemePage = new SchemePage(page);
    const towerListingPage = new TowerListingPage(page);
    const notyMessage = new NotyMessage(page);

    // Generate random data
    const towerName = "Tower " + await utils.generateRandomNumber(3);
    const paymentScheduleName = "PS-" + await utils.generateRandomString(10, { casing: 'upper', includeNumbers: false, includeSpecialChars: false });
    
    // Declare variables for assertions
    let actualTowerName: string;
    let actualPSName: string;

    // Login
    await loginPage.login(properties.PC_Client_Admin_user, properties.PASSWORD);
    
    // Navigate to Project Towers
    await sidePanel.hoverOnProjectTowersProductsServiceAndClick();
    
    // Create Tower
    await createTowerPage.clickNewTower();
    await createTowerPage.enterTowerName(towerName);
    await createTowerPage.selectProject(properties.PT_ProjectName);
    await createTowerPage.enterTotalFloors(properties.PT_TotalFloors);
    await createTowerPage.clickSave();
    
    // Assertion - Tower created successfully using NotyMessage
    const towerSuccessMessage = await notyMessage.getNotyMessage(true);
    expect(towerSuccessMessage).toContain("Project Tower is successfully created");

    // Get and validate tower name - populate it after success
    actualTowerName = await createTowerPage.getTowerNameFromPage();
    expect(actualTowerName).toBe(towerName);
    
    // Add Tower Stage
    await createTowerPage.clickProjectTowerStages();
    await towerStagesPage.clickAddStage();
    await towerStagesPage.enterStageName(properties.PT_StageName);
    await towerStagesPage.clickSave();
    
    // Assertion - Stage added using NotyMessage
    const stageSuccessMessage = await notyMessage.getNotyMessage(true);
    expect(stageSuccessMessage).toContain("Project Tower is successfully updated.");
    
    // Create Payment Schedule
    await createTowerPage.clickPaymentSchedules();
    await paymentSchedulePage.clickNewSchedule();
    await paymentSchedulePage.enterPaymentScheduleName(paymentScheduleName);
    await paymentSchedulePage.selectTemplate();
    await paymentSchedulePage.clickSavePaymentSchedule();
    
    // Assertion - Payment schedule created successfully using NotyMessage
    const psSuccessMessage = await notyMessage.getNotyMessage(true);
    expect(psSuccessMessage).toContain("Payment schedule created successfully");

    // Get and validate Payment Schedule name directly from the page
    actualPSName = await paymentSchedulePage.getPSNameFromPage();
    expect(actualPSName).toBe(paymentScheduleName);
    
    // Approve Payment Schedule
    await paymentSchedulePage.clickAllPaymentSchedules();
    await paymentSchedulePage.clickOnPaymentScheduleRow(paymentScheduleName);
    await paymentSchedulePage.clickApprove();
    
    // Assertion - Payment schedule approved successfully using NotyMessage
    const approveSuccessMessage = await notyMessage.getNotyMessage(true);
    expect(approveSuccessMessage).toContain("Payment schedule status updated successfully");
    
    // Activate Scheme
    await createTowerPage.clickBackToProjectTower();
    await createTowerPage.clickSchemes();
    await schemePage.clickDefaultScheme();
    await schemePage.clickActivate();
    
    // Assertion - Scheme activated successfully using NotyMessage
    const schemeSuccessMessage = await notyMessage.getNotyMessage(true);
    expect(schemeSuccessMessage).toContain("Scheme updated successfully.");

    // Go to Tower listing page
    await createTowerPage.clickAllProjectTower();
    await towerListingPage.clickFilter();
    await towerListingPage.filterSelectedTower(towerName);
    await towerListingPage.clickApplyFilter();

    // Get and validate tower name - populate it after success
    actualTowerName = await createTowerPage.getTowerNameFromPage();
    expect(actualTowerName).toBe(towerName);
});
