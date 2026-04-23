import {test, expect} from '@playwright/test'
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { properties } from "../../properties/v2.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { SidePanal } from '../../pages/AdminAndSupportPages/SidePanal.ts';
import { CreateDeveloperPage } from '../../pages/InventoryPages/DeveloperPage/CreateDeveloperPage.ts';
import { DeveloperListingPage } from '../../pages/InventoryPages/DeveloperPage/DeveloperlistingPage.ts';
import { UpdateDeveloperPage } from '../../pages/InventoryPages/DeveloperPage/UpdateDeveloperPage.ts';


test('Create Developer', async({page}) =>
{
  const loginPage = new LoginPage(page);
  const utils = new Utils();
  const sidePanel = new SidePanal(page);
  const createDeveloperPage = new CreateDeveloperPage(page);
  const developerListingPage = new DeveloperListingPage(page);
  const updateDeveloperPage = new UpdateDeveloperPage(page);

  const devName = "Developer "+ await utils.generateRandomString(6,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
  const firstName = await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
  const lastName = await utils.generateRandomString(4,{casing:'lower',includeNumbers:false,includeSpecialChars:false});
  const devNumber = await utils.generateRandomPhoneNumber();
  const devEmail = await utils.generateRandomEmail();

  await loginPage.login(properties.PC_Client_Admin_user, properties.PASSWORD);
  await sidePanel.hoverOnDeveloperProductsServiceAndClick();
  await createDeveloperPage.clickOnNewDeveloper();
  await createDeveloperPage.enterDeveloperName(devName);
  await createDeveloperPage.enterSalutation();
  await createDeveloperPage.enterFirstName(firstName);
  await createDeveloperPage.enterLastName(lastName);
  await createDeveloperPage.enterPhoneNumber(devNumber);
  await createDeveloperPage.enterEmail(devEmail);
  await createDeveloperPage.clickSave();
//assertion
  expect(await createDeveloperPage.isDeveloperCreatedSuccessfully()).toBeTruthy();
//Edit-Update Developer
  await createDeveloperPage.clickAllDeveloper();
  await developerListingPage.clickFilter();
  await developerListingPage.filterSelectDeveloper(devName);
  await developerListingPage.applyFilter();
  await updateDeveloperPage.enterDescription();
  await createDeveloperPage.clickSave();
//assertion  
  expect(await updateDeveloperPage.isDeveloperUpdatedSuccessfully()).toBeTruthy();
});