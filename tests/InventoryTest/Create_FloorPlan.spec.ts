import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { SidePanal } from "../../pages/AdminAndSupportPages/SidePanal.ts";
import { CreateFloorPlanPage } from "../../pages/InventoryPages/FloorPlanPage/CreateFloorPlanPage.ts";
import { FloorPlanListingPage } from "../../pages/InventoryPages/FloorPlanPage/FloorPlanListingPage.ts";
import { NotyMessage } from "../../pages/AdminAndSupportPages/NotyMessage.ts";

test('Create Floor Plan', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const utils = new Utils();
    const sidePanel = new SidePanal(page);
    const createFloorPlanPage = new CreateFloorPlanPage(page);
    const floorPlanListingPage = new FloorPlanListingPage(page);
    let actualFloorPlanName: string;
    const notyMessage = new NotyMessage(page);

  // Generate random floor plan name
    const floorPlanName = "FLP for 1 BHK " + await utils.generateRandomString(4,{casing: 'lower',includeNumbers: false,includeSpecialChars: false});
    
  // Login and navigate
    await loginPage.login(properties.PC_Client_Admin_user, properties.PASSWORD);
    await sidePanel.hoverOnFloorPlanProductsServiceAndClick(); 
  
  // Create floor plan   
    await createFloorPlanPage.clickOnNewFloorPlan();
    await createFloorPlanPage.selectDeveloper(properties.FP_DeveloperName);
    await createFloorPlanPage.selectProject(properties.FP_ProjectName);
    await createFloorPlanPage.selectProjectTower(properties.FP_TowerName);
    await createFloorPlanPage.enterFloorPlanName(floorPlanName);
    await createFloorPlanPage.selectUnitType(properties.FP_UnitType);
    await createFloorPlanPage.selectUnitCategory(properties.FP_UnitCategory);
    await createFloorPlanPage.selectBedrooms(properties.FP_Bedroom);
    await createFloorPlanPage.selectBathrooms(properties.FP_Bathroom);
    await createFloorPlanPage.enterCarpetArea(properties.FP_Carpet);
    await createFloorPlanPage.enterSaleableArea(properties.FP_Saleable);
    await createFloorPlanPage.enterLoading(properties.FP_Loading);
    await createFloorPlanPage.enterCoveredArea(properties.FP_CoveredArea);
    await createFloorPlanPage.enterTerraceArea(properties.FP_TerraceArea);
    await createFloorPlanPage.enterBaseRate(properties.FP_BaseRate);
    await createFloorPlanPage.clickSave();
      
    // Assertion
    const fpSuccessMessage = await notyMessage.getNotyMessage(true);
    expect(fpSuccessMessage).toContain("Floor Plan is successfully created.");

    // Validate cretaed floor plan
    actualFloorPlanName = await createFloorPlanPage.getFloorPlanNameFromPage();
    expect(actualFloorPlanName).toBe(floorPlanName);

    // Go to Floor Plan Listing Page    
    await createFloorPlanPage.clickAllFloorPlans();
    await floorPlanListingPage.clickFilter();
    await floorPlanListingPage.filterSelectedFP(floorPlanName);
    await floorPlanListingPage.clickApplyFilter();

    // Get and validate floor plan name - populate it after success
    actualFloorPlanName = await createFloorPlanPage.getFloorPlanNameFromPage();
    expect(actualFloorPlanName).toBe(floorPlanName);
});





