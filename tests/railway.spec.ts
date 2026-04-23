import { test, expect } from '@playwright/test';
import { properties } from '../Environment/env';
import { LeadAPIUtils } from '../utils/APIUtils/LeadAPIUtils';
import { Utils } from '../utils/PlaywrightTestUtils';


test('Testrail', async ({ page }) => {
  console.log("SELLD_ADMIN_EMAIL: ", properties.Admin_email);
  console.log("SELLD_CLIENT_ID: ", properties.CLIENT_ID);
  console.log("SELLD_FULL_ACCESS_API: ", properties.FULL_ACCESS_API);
  console.log("SELLD_PASSWORD: ", properties.PASSWORD);
  console.log("SELLD_RESTRICTED_ACCESS_API: ", properties.RESTRICTED_ACCESS_API);
  const utils = new Utils();

  // random phone
  const randomPhone = await utils.generateRandomPhoneNumberWithCountry();
  console.log("Random phone: ", randomPhone);
  // random email
  const randomEmail = await utils.generateRandomEmail();
  console.log("Random email: ", randomEmail);
  // create lead with api
  const leadAPIUtils = new LeadAPIUtils(properties.CLIENT_ID as string,properties.FULL_ACCESS_API as string,properties.RESTRICTED_ACCESS_API as string);
  const lead = await leadAPIUtils.createLeadWithDetails(randomPhone.phoneNumber, randomEmail, "Test Lead", "Test Source", "Test Sub Source", "1234567890", "1234567890", "1234567890", true, "1234567890");
  console.log("Lead created: ", lead);
});
