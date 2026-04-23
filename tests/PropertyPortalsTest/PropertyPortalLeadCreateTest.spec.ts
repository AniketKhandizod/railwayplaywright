import { test, expect } from '@playwright/test';
import { properties } from "../../properties/v2.ts";
import { LeadAPIUtils } from "../../utils/APIUtils/LeadAPIUtils.ts";
import { Utils } from "../../utils/PlaywrightTestUtils.ts";

test.describe.configure({ mode: "parallel" });
const waitTime = 10000; // 10 seconds
test.describe.configure({ timeout: 1000000 });
test('Create Lead via Housing Pusher API with project', async () => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const projectName = "hou";

  // Create lead via Housing Pusher API
  await leadAPIUtils.createLeadViaHousingPusher(
    properties.Housing_Pusher_API_Key,
    leadEmail,
    leadPhone,
    projectName
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  expect(leadData.status).toBe(200);
  expect(leadData.lead.first_name).toBeDefined();
  expect(leadData.lead.email).toBe(leadEmail);
  expect(leadData.lead.phone).toBe(leadPhone);
  expect(leadData.lead.campaigns[0].name).toBe('organic');
  expect(leadData.lead.campaigns[0].source).toBe('housing_pusher');
  expect(leadData.lead.campaigns[0].sub_source).toBe('housing_pusher');
  expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.campaigns[0].project_id).toBe(properties.Project_id_2);

});

test('Create Lead via Housing Pusher API without project', async () => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const projectName = "";

  // Create lead via Housing Pusher API
  await leadAPIUtils.createLeadViaHousingPusher(
    properties.Housing_Pusher_API_Key,
    leadEmail,
    leadPhone,
    projectName
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  expect(leadData.status).toBe(200);
  expect(leadData.lead.first_name).toBeDefined();
  expect(leadData.lead.email).toBe(leadEmail);
  expect(leadData.lead.phone).toBe(leadPhone);
  expect(leadData.lead.campaigns[0].name).toBe('organic');
  expect(leadData.lead.campaigns[0].source).toBe('housing_pusher');
  expect(leadData.lead.campaigns[0].sub_source).toBe('housing_pusher');
  expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.campaigns[0].project_id).toBe(null);

});

test('Create Lead via Roof and Floor API with project', async () => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const projectName = "roof";

  // Create lead via Roof and Floor API
  await leadAPIUtils.createLeadViaRoofAndFloor(
    properties.Roof_And_Floor_API_Key,
    leadEmail,
    leadPhone,
    projectName
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  expect(leadData.status).toBe(200);
  expect(leadData.lead.phone).toBe(leadPhone);
  expect(leadData.lead.first_name).toBeDefined();
  expect(leadData.lead.email).toBe(leadEmail);
  expect(leadData.lead.campaigns[0].name).toBe('organic');
  expect(leadData.lead.campaigns[0].source).toBe('roofandfloor_pusher');
  expect(leadData.lead.campaigns[0].sub_source).toBe('roofandfloor_pusher');
  expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.campaigns[0].project_id).toBe(properties.Project_id_2);

});

test('Create Lead via Roof and Floor API without project', async () => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const projectName = "";

  // Create lead via Roof and Floor API
  await leadAPIUtils.createLeadViaRoofAndFloor(
    properties.Roof_And_Floor_API_Key,
    leadEmail,
    leadPhone,
    projectName
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  expect(leadData.status).toBe(200);
  expect(leadData.lead.phone).toBe(leadPhone);
  expect(leadData.lead.first_name).toBeDefined();
  expect(leadData.lead.email).toBe(leadEmail);
  expect(leadData.lead.campaigns[0].name).toBe('organic');
  expect(leadData.lead.campaigns[0].source).toBe('roofandfloor_pusher');
  expect(leadData.lead.campaigns[0].sub_source).toBe('roofandfloor_pusher');
  expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.campaigns[0].project_id).toBe(null);

});

test('Create Lead via MagicBricks API with project', async () => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const projectName = "magic";

  // Create lead via MagicBricks API
  await leadAPIUtils.createLeadViaMagicBricks(
    properties.MagicBricks_API_Key,
    leadEmail,
    leadPhone,
    projectName
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  expect(leadData.status).toBe(200);
  expect(leadData.lead.phone).toBe(leadPhone);
  expect(leadData.lead.first_name).toBeDefined();
  expect(leadData.lead.email).toBe(leadEmail);
  expect(leadData.lead.campaigns[0].name).toBe('organic');
  expect(leadData.lead.campaigns[0].source).toBe('magicbricks_pusher');
  expect(leadData.lead.campaigns[0].sub_source).toBe('magicbricks_pusher');
  expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.campaigns[0].project_id).toBe(properties.Project_id_2);

});

test('Create Lead via Commonfloor Pusher API with project', async () => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const projectName = "common";

  // Create lead via Commonfloor Pusher API
  await leadAPIUtils.createLeadViaCommonfloorPusher(
    properties.Commonfloor_Pusher_API_Key,
    leadEmail,
    leadPhone,
    projectName
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  expect(leadData.status).toBe(200);
  expect(leadData.lead.phone).toBe(leadPhone);
  expect(leadData.lead.first_name).toBeDefined();
  expect(leadData.lead.email).toBe(leadEmail);
  expect(leadData.lead.campaigns[0].name).toBe('organic');
  expect(leadData.lead.campaigns[0].source).toBe('commonfloor_pusher');
  expect(leadData.lead.campaigns[0].sub_source).toBe('commonfloor_pusher');
  expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.campaigns[0].project_id).toBe(properties.Project_id_2);

});

test('Create Lead via 99acres API with project', async () => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const projectName = "acres";

  // Create lead via 99acres API
  await leadAPIUtils.createLeadVia99Acres(
    properties.NinetyNineAcres_API_Key,
    leadEmail,
    leadPhone,
    projectName
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  expect(leadData.status).toBe(200);
  expect(leadData.lead.phone).toBe(leadPhone);
  expect(leadData.lead.first_name).toBeDefined();
  expect(leadData.lead.email).toBe(leadEmail);
  expect(leadData.lead.campaigns[0].name).toBe('organic');
  expect(leadData.lead.campaigns[0].source).toBe('acres_pusher');
  expect(leadData.lead.campaigns[0].sub_source).toBe('acres_pusher');
  expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.campaigns[0].project_id).toBe(properties.Project_id_2);

});

test('Create Lead via 99acres API without project', async () => {
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const leadPhone = await utils.generateRandomPhoneNumber();
  const projectName = "";

  // Create lead via 99acres API
  await leadAPIUtils.createLeadVia99Acres(
    properties.NinetyNineAcres_API_Key,
    leadEmail,
    leadPhone,
    projectName
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  expect(leadData.status).toBe(200);
  expect(leadData.lead.phone).toBe(leadPhone);
  expect(leadData.lead.first_name).toBeDefined();
  expect(leadData.lead.email).toBe(leadEmail);
  expect(leadData.lead.campaigns[0].name).toBe('organic');
  expect(leadData.lead.campaigns[0].source).toBe('acres_pusher');
  expect(leadData.lead.campaigns[0].sub_source).toBe('acres_pusher');
  expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.campaigns[0].project_id).toBe(null);

});

test('Create Lead via Facebook API', async () => {
  for(let i = 0; i < 10; i++){
  const utils = new Utils();
  const leadAPIUtils = new LeadAPIUtils(properties.Client_id, properties.FullAccess_API, properties.RestrictedAccess_API);

  // Generate random test data
  const leadEmail = await utils.generateRandomEmail();
  const { phoneNumber, country } = await utils.generateRandomPhoneNumberWithCountry();
  console.log(leadEmail, phoneNumber, country);
  // Create lead via Facebook API
  await leadAPIUtils.createLeadViaFacebook(
    leadEmail,
    phoneNumber
  );

  await utils.sleep(waitTime);
  // Validate lead details using email
  const leadData = await leadAPIUtils.leadRetrieve(leadEmail);
  // expect(leadData.status).toBe(200);
  // expect(leadData.lead.phone).toBe(phoneNumber.split(' ')[1]);
  // expect(leadData.lead.first_name).toBeDefined();
  // expect(leadData.lead.email).toBe(leadEmail);
  // expect(leadData.lead.campaigns[0].source).toBe('fb_lead_ad');
  // expect(leadData.lead.campaigns[0].sub_source).toBe('fb_lead_ad');
  // expect(leadData.lead.campaigns[0].medium_type).toBe('ApiClient');
  expect(leadData.lead.country).toBe(country);
  }

});