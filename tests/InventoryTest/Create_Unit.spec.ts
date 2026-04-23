import { test, expect } from '@playwright/test';
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal.ts';
import { NotyMessage } from '../../pages/AdminAndSupportPages/NotyMessage.ts';
import { bathroom, bedroom, CreateUnitPage, propertyPurpose} from '../../pages/InventoryPages/UnitPage/CreateUnitPage.ts';
import { UnitListingPage } from '../../pages/InventoryPages/UnitPage/UnitListingPage.ts';

test('CreateUnit',async({page})=> {
    const loginPage = new LoginPage(page);
    const utils = new Utils();
    const sidePanel = new SidePanal(page);
    const notyMessage = new NotyMessage(page);
    const createUnitPage = new CreateUnitPage(page);
    const unitListingPage = new UnitListingPage(page);
    let actualUnitName: string;

    const unitName = await utils.generateRandomNumber(5);

    await loginPage.login(properties.PC_Client_Admin_user,properties.PASSWORD);
    await sidePanel.hoverOnUnitsProductsServiceAndClick();
    await createUnitPage.clickOnNewUnit();
    await createUnitPage.selectDeveloperForUnitCreation(properties.UN_DeveloperName);
    await createUnitPage.selectProjectForUnitCreation(properties.UN_ProjectName);
    await createUnitPage.selectTowerForUnitCreation(properties.UN_TowerName);
    await createUnitPage.selectUnitConfigurationForUnitCreation(properties.UN_UnitConfiguration);
    await createUnitPage.enterUnitName(unitName);
    await createUnitPage.enterFloorNumber(properties.UN_FloorNumber);
    await createUnitPage.selectPropertyPurpose(propertyPurpose.sale);
    await createUnitPage.selectBedrooms(bedroom.one_bedroom);
    await createUnitPage.selectBathrooms(bathroom.one_bathroom);
    await createUnitPage.clickSave();
    // Assertion
    const unitSuccessMessage = await notyMessage.getNotyMessage(true);
    expect(unitSuccessMessage).toContain("Units are successfully created.");
    // Get and validate Unit name - populate it after success
    actualUnitName = await createUnitPage.getUnitNameFromPage();
    expect(actualUnitName).toBe(unitName);
    
    await createUnitPage.clickAllUnits();
    await unitListingPage.clickFilterIcon();
    await unitListingPage.filterSelectUnit(unitName);
    await unitListingPage.applyUnitFilter();  

    // Validate that the unit name matches
    const filteredUnitName = await unitListingPage.getFilteredUnitName();
    expect(filteredUnitName).toContain(unitName);
});