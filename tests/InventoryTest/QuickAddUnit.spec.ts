// tests/InventoryTest/QuickAddUnit.spec.ts
import { test, expect } from '../../dataProvider/TestDataForQuickAddUnitByPurpose.ts';
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { properties } from "../../properties/v2.ts";
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal.ts';
import { QuickAddUnitPage} from '../../pages/InventoryPages/UnitPage/QuickAddUnitPage.ts';
import { UnitListingPage } from '../../pages/InventoryPages/UnitPage/UnitListingPage.ts';

test.describe.configure({ mode: "serial" });
test.describe('Quick Add Unit', () => {
  const testPurposes = ['Sale Purpose', 'Resale Purpose', 'Rental Purpose'];
  
  for (const purposeName of testPurposes) {
    test(`QuickAddUnit - ${purposeName}`, async ({ page, testDataForQuickAddUnitByPurpose }) => {
      const loginPage = new LoginPage(page);
      const sidePanel = new SidePanal(page);
      const quickAddUnitPage = new QuickAddUnitPage(page);
      const unitListingPage = new UnitListingPage(page);

      const testData = testDataForQuickAddUnitByPurpose.find(d => d.TestFor === purposeName)!.TestData;

      await loginPage.login(properties.PC_Client_Admin_user, properties.PASSWORD);
      await sidePanel.hoverOnQuickAddUnitProductsServiceAndClick();
      await quickAddUnitPage.selectPurpose(testData.purpose);
      await quickAddUnitPage.selectProject(testData.projectName);
      await quickAddUnitPage.selectUnitType(testData.unitType);
      await quickAddUnitPage.selectUnitCategory(testData.unitCategory);
      await quickAddUnitPage.selectFurnishingType(testData.furnishingType);
      await quickAddUnitPage.selectProjectTower(testData.towerName);
      await quickAddUnitPage.enterUnitName(testData.unitName);
      await quickAddUnitPage.enterFloor(testData.floorNumber);
      await quickAddUnitPage.selectBHKType(testData.bhkType);
      await quickAddUnitPage.enterCarpetArea(testData.carpetArea);
      await quickAddUnitPage.enterSaleableArea(testData.saleableArea);
      await quickAddUnitPage.fillPurposeSpecificFields(testData);
      await quickAddUnitPage.publishAndNext();
      await quickAddUnitPage.selectAllAmenities();
      await quickAddUnitPage.saveUnit();
      await quickAddUnitPage.finalSave();
      await quickAddUnitPage.navigateToOtherDetails();
      await quickAddUnitPage.fillPropertyOwnerDetails(testData);
      await quickAddUnitPage.saveUnit();
      await quickAddUnitPage.finalSave();      
      // Assertions
      await quickAddUnitPage.waitForSuccessMessage();
      const successMessage = await quickAddUnitPage.getSuccessMessageText();
      expect(successMessage).toContain(testData.expectedSuccessMessage);      
      // Validate by filtering 
      await unitListingPage.clickFilterIcon();
      await unitListingPage.filterSelectUnit(testData.unitName);
      await unitListingPage.applyUnitFilter();
      const filteredUnitName = await unitListingPage.getFilteredUnitName();
      expect(filteredUnitName).toBe(testData.unitName);
    });
  }
});