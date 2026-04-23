import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { LoginPage } from "../../pages/CommonPages/loginPage.ts";
import { ClientManagementPage } from "../../pages/AdminAndSupportPages/ClienCreationPages/ClientCreationForm.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";
import { LoginAsClientPage } from "../../pages/AdminAndSupportPages/LoginAsClientPage.ts";
import * as path from "path";
import { ClientBusinessType } from "../../pages/AdminAndSupportPages/ClienCreationPages/ClientCreationForm.ts";




test('Postpaid Client Creation', async ({ page }) => {


const loginPage = new LoginPage(page);
const clientManagement = new ClientManagementPage(page);
const utils = new Utils();
const loginAsClientPage = new LoginAsClientPage(page);
const imagePath = path.join(__dirname, "../../utils/assets/Images/sell.dologo.png");
  // Generate random data
const clientFirstName = await utils.generateRandomString(8);
const clientLastName = await utils.generateRandomString(8);
const clientEmail = `dhananjay.poul+${clientFirstName}@sell.do`;
const clientPhone = `+91 ${await utils.generateRandomPhoneNumber()}`;
const websiteUrl = `https://www.${clientFirstName}.com`;
const smsMask = await utils.generateRandomString(6, { casing: "upper" });
const shortName = await utils.generateRandomString(6);
const salesPersonName = await utils.generateRandomString(8);
const onboardingPersonName = await utils.generateRandomString(8);
const clientCity = await utils.generateRandomString(8);
const clientZip = Math.floor(100000 + Math.random() * 900000).toString();
const accountManagerFirstName = await utils.generateRandomString(8);
const accountManagerLastName = await utils.generateRandomString(8);
const accountManagerPhone = await utils.generateRandomPhoneNumber();
const accountManagerEmail = `dhananjay.poul+${await utils.generateRandomString(8)}@sell.do`;
const clientUserFirstName = await utils.generateRandomString(8);
const clientUserLastName = await utils.generateRandomString(8);
const clientUserPhone = await utils.generateRandomPhoneNumber();
const clientUserEmail = `dhananjay.poul+${await utils.generateRandomString(8)}@sell.do`;
const teamName = await utils.generateRandomString(8);
const clientAddress1 = await utils.generateRandomString(8);

  await loginPage.login(properties.SM_08, properties.PASSWORD);
  await utils.waitTillFullPageLoad(page);

  // Check if Add Client button is visible, if not then logout and retry
  const isAddClientVisible = await loginAsClientPage.isAddClientButtonVisible();
  expect(isAddClientVisible).toBe(true);

  if (!isAddClientVisible) {
    // Click on profile and logout
    await loginPage.profileButton.click();
    await loginPage.logoutButton.click();
    await utils.waitTillFullPageLoad(page);

    // Login again
    await loginPage.login(properties.SM_08, properties.PASSWORD);
    await utils.waitTillFullPageLoad(page);
  }

  await loginAsClientPage.clickOnAddClient();
  await utils.waitTillFullPageLoad(page);
  await clientManagement.fillFirstName(clientFirstName);
  await clientManagement.fillLastName(clientLastName);
  await clientManagement.fillClientPhone(clientPhone);
  await clientManagement.fillBusinessName(clientFirstName);
  await clientManagement.selectBusinessType(ClientBusinessType.Developer);
  await clientManagement.fillSMSMask(smsMask);
  await clientManagement.fillShortName(shortName);
  await clientManagement.fillWebsite(websiteUrl);
  await clientManagement.fillClientEmail(clientEmail);
  await clientManagement.fillSalesPersonName(salesPersonName);
  await clientManagement.fillOnboardingPersonName(onboardingPersonName);
  await clientManagement.selectClientCategory("A");
  await clientManagement.uploadClientImage(imagePath);
  await utils.waitTillFullPageLoad(page);
  await clientManagement.fillClientAddress(clientFirstName);
  await clientManagement.selectClientCountry("India");
  await utils.waitTillFullPageLoad(page);
  await clientManagement.selectClientState("Maharashtra");
  await clientManagement.fillClientCity(clientCity);
  await clientManagement.fillClientZip(clientZip);
  await clientManagement.fillAccountManagerFirstName(accountManagerFirstName);
  await clientManagement.fillAccountManagerLastName(accountManagerLastName);
  await clientManagement.fillAccountManagerPhone(accountManagerPhone);
  await clientManagement.fillAccountManagerEmail(accountManagerEmail);
  await clientManagement.fillClientUserFirstName(clientUserFirstName);
  await clientManagement.fillClientUserLastName(clientUserLastName);
  await clientManagement.fillClientUserPhone(clientUserPhone);
  await clientManagement.fillClientUserEmail(clientUserEmail);

  await clientManagement.fillTeamName(teamName);
  await clientManagement.saveClient();
  await utils.waitTillFullPageLoad(page);
});